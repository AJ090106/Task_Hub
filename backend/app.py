import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
from celery.result import AsyncResult
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import resend


from celery_worker import (
    celery,
    generate_all_variations
)

load_dotenv()



app = Flask(__name__)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per minute"]
)

CORS(app)

app.config.update(
    broker_url='redis://127.0.0.1:6379/0',
    result_backend='redis://127.0.0.1:6379/0'
)

celery.conf.update(app.config)

#supabase client
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL"
)

SUPABASE_KEY = (
    os.environ.get(
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    or
    os.environ.get(
        "SUPABASE_ANON_KEY"
    )
)

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

#helper functions
VALID_STATUSES = [
    "assigned",
    "in_progress",
    "processing",
    "submitted",
    "accepted",
    "revision_requested",
    "failed"
]


def normalize_task(task):

    resolved_status = (
        task.get("status")
        or "assigned"
    )

    if resolved_status not in VALID_STATUSES:
        resolved_status = "assigned"

    task["status"] = resolved_status

    return task


def validate_required_fields(
    data,
    required_fields
):

    missing = []

    for field in required_fields:

        if not data.get(field):
            missing.append(field)

    return missing
def create_audit_log(
    table_name,
    record_id,
    action,
    old_data=None,
    new_data=None,
    changed_by=None
):

    try:

        supabase.table(
            'audit_logs'
        ).insert({

            "table_name":
                table_name,

            "record_id":
                record_id,

            "action":
                action,

            "old_data":
                old_data,

            "new_data":
                new_data,

            "changed_by":
                changed_by

        }).execute()

    except Exception as e:

        print(
            f"[AUDIT ERROR]: {str(e)}"
        )

def send_email_notification(
    email_type,
    recipient,
    task_title,
    message=None
):

    try:

        subject = ""
        html = ""

        if email_type == "task_assigned":

            subject = "New Task Assigned"

            html = f"""
            <div style="font-family:sans-serif;padding:20px;">
                <h2>New Task Assigned</h2>
                <p>You have been assigned a new task.</p>
                <p><strong>Task:</strong> {task_title}</p>
            </div>
            """

        elif email_type == "task_submitted":

            subject = "Task Submitted"

            html = f"""
            <div style="font-family:sans-serif;padding:20px;">
                <h2>Task Submitted</h2>
                <p>A task has been submitted for review.</p>
                <p><strong>Task:</strong> {task_title}</p>
            </div>
            """

        elif email_type == "task_accepted":

            subject = "Task Accepted"

            html = f"""
            <div style="font-family:sans-serif;padding:20px;">
                <h2>Task Accepted</h2>
                <p>Your task has been approved.</p>
                <p><strong>Task:</strong> {task_title}</p>
            </div>
            """

        elif email_type == "revision_requested":

            subject = "Revision Requested"

            html = f"""
            <div style="font-family:sans-serif;padding:20px;">
                <h2>Revision Requested</h2>
                <p>Your submission requires revisions.</p>
                <p><strong>Task:</strong> {task_title}</p>
                <p>{message or ""}</p>
            </div>
            """

        resend.Emails.send({

            "from":
                "Lumora <onboarding@resend.dev>",

            "to":
                recipient,

            "subject":
                subject,

            "html":
                html,
        })

        print(
            f"[EMAIL SENT]: {recipient}"
        )

    except Exception as e:

        print(
            f"[EMAIL ERROR]: {str(e)}"
        )

#check if api is healthy
@app.route('/api/health', methods=['GET'])
def health():

    return jsonify({
        "status": "healthy"
    }), 200

#auth
@app.route('/api/auth/me', methods=['GET'])
def auth_me():

    return jsonify({
        "status": "success"
    }), 200


@app.route(
    '/api/auth/logout',
    methods=['POST']
)
def auth_logout():

    return jsonify({
        "status": "logged_out"
    }), 200

#all users
@app.route('/api/users', methods=['GET'])
def list_users():

    try:

        response = (
            supabase
            .table('profiles')
            .select('*')
            .execute()
        )

        users = response.data or []

        return jsonify(users), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

#Admin-create task
@app.route('/api/tasks', methods=['POST'])
def create_task():

    try:

        data = request.json or {}

        missing = validate_required_fields(
            data,
            [
                "title",
                "product_image_url",
                "assigned_to"
            ]
        )

        if missing:

            return jsonify({
                "error":
                f"Missing fields: {missing}"
            }), 400

        insert_payload = {

            "title":
                data.get("title"),

            "description":
                data.get(
                    "description",
                    ""
                ),

            "status":
                "assigned",

            "product_image_url":
                data.get(
                    "product_image_url"
                ),

            "assigned_to":
                data.get(
                    "assigned_to"
                ),

            "created_by":
                data.get(
                    "created_by",
                    "admin_01"
                )
        }

        response = (
            supabase
            .table('tasks')
            .insert(insert_payload)
            .execute()
        )

        created_task = (
            response.data[0]
        )
        create_audit_log(

            table_name='tasks',
            record_id=created_task["id"],
            action='task_created',
            new_data=created_task,
            changed_by=data.get(
                    "created_by","admin_01"
                )
        )
        send_email_notification(

    "task_assigned",

    recipient="user@example.com",

    task_title=created_task["title"]
)


        return jsonify({
            "status": "success",
            "task": created_task
        }), 201

    except Exception as e:

        print(
            f"[CREATE TASK ERROR]: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500

#admin-all tasks

@app.route('/api/tasks', methods=['GET'])
def list_tasks():

    try:

        response = (
            supabase
            .table('tasks')
            .select('*')
            .order(
                'created_at',
                desc=True
            )
            .execute()
        )

        tasks = [
            normalize_task(task)
            for task in (
                response.data or []
            )
        ]

        return jsonify(tasks), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


#user-my tasks

@app.route(
    '/api/my-tasks',
    methods=['GET']
)
def get_my_tasks():

    try:

        user_id = request.args.get(
            'user_id'
        )

        if not user_id:

            return jsonify({
                "error":
                "user_id required"
            }), 400

        response = (
            supabase
            .table('tasks')
            .select('*')
            .eq(
                'assigned_to',
                user_id
            )
            .order(
                'created_at',
                desc=True
            )
            .execute()
        )

        tasks = [
            normalize_task(task)
            for task in (
                response.data or []
            )
        ]

        return jsonify(tasks), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

#get task details
@app.route(
    '/api/tasks/<task_id>',
    methods=['GET']
)
def get_task(task_id):

    try:

        task_query = (
            supabase
            .table('tasks')
            .select('*')
            .eq(
                'id',
                str(task_id)
            )
            .execute()
        )

        if not task_query.data:

            return jsonify({
                "error":
                "Task not found"
            }), 404

        task_data = normalize_task(
            task_query.data[0]
        )

        images_query = (
            supabase
            .table('generated_images')
            .select('*')
            .eq(
                'task_id',
                str(task_id)
            )
            .execute()
        )

        task_data["variations"] = (
    images_query.data or []
)

        return jsonify(task_data), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

#assign task to user, status moves to assigned
@app.route(
    '/api/tasks/<task_id>/assign',
    methods=['POST']
)
def assign_task(task_id):

    try:

        data = request.json or {}

        assigned_to = data.get(
            "assigned_to"
        )

        if not assigned_to:

            return jsonify({
                "error":
                "assigned_to required"
            }), 400

        response = (
            supabase
            .table('tasks')
            .update({
                "assigned_to":
                    assigned_to,

                "status":
                    "assigned"
            })
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        return jsonify({
            "status": "assigned",
            "task": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

#user starts working on task, status moves to in_progress
@app.route(
    '/api/tasks/<task_id>/start',
    methods=['PUT']
)
def start_task(task_id):

    try:

        # Fetch existing task
        old_task = (
            supabase
            .table('tasks')
            .select('*')
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        if not old_task.data:

            return jsonify({
                "error":
                "Task not found"
            }), 404

        old_data = old_task.data[0]

        # Prevent invalid transitions
        current_status = (
            old_data.get("status")
            or "assigned"
        )

        if current_status not in [
            "assigned",
            "revision_requested"
        ]:

            return jsonify({
                "error":
                f"Cannot start task from status '{current_status}'"
            }), 400

        # Update task
        response = (
            supabase
            .table('tasks')
            .update({
                "status":
                    "in_progress"
            })
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        updated_task = (
            response.data[0]
            if response.data
            else None
        )

        # Audit log
        create_audit_log(

            table_name='tasks',

            record_id=task_id,

            action='task_started',

            old_data=old_data,

            new_data=updated_task,

            changed_by=
                old_data.get(
                    "assigned_to"
                )
        )

        return jsonify({

            "status":
                "in_progress",

            "task":
                updated_task

        }), 200

    except Exception as e:

        print(
            f"[START TASK ERROR]: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500
#ai generation results will be posted to this endpoint by the worker once 
@limiter.limit("10 per hour")
@app.route(
    '/api/tasks/<task_id>/generate',
    methods=['POST']
)
def generate_task(task_id):

    try:

        task_query = (
            supabase
            .table('tasks')
            .select('*')
            .eq(
                'id',
                str(task_id)
            )
            .execute()
        )

        if not task_query.data:

            return jsonify({
                "error":
                "Task not found"
            }), 404

        task_data = (
            task_query.data[0]
        )

        (
            supabase
            .table('tasks')
            .update({
                "status":
                    "processing"
            })
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        job = (
            generate_all_variations
            .delay(
                str(task_id),
                task_data[
                    "product_image_url"
                ]
            )
        )

        return jsonify({

            "status":
                "generation_started",

            "job_id":
                job.id

        }), 200

    except Exception as e:

        print(
            f"[GENERATION ERROR]: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500

#job status
@app.route(
    '/api/jobs/<job_id>/status',
    methods=['GET']
)
def get_job_status(job_id):

    try:

        result = AsyncResult(
            job_id,
            app=celery
        )

        return jsonify({

            "job_id":
                job_id,

            "status":
                result.status,

            "successful":
                result.successful(),

            "failed":
                result.failed()

        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

#get task generations
@app.route(
    '/api/tasks/<task_id>/generations',
    methods=['GET']
)
def get_task_generations(task_id):

    try:

        response = (
            supabase
            .table('generated_images')
            .select('*')
            .eq(
                'task_id',
                str(task_id)
            )
            .execute()
        )

        return jsonify(
            response.data or []
        ), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

#delete generation

@app.route(
    '/api/generations/<generation_id>',
    methods=['DELETE']
)
def delete_generation(generation_id):

    try:

        response = (
            supabase
            .table('generated_images')
            .delete()
            .eq(
                'id',
                str(generation_id)
            )
            .execute()
        )

        return jsonify({
            "status": "deleted",
            "data": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# Submit Task for Review
# Submit Task for Review
@app.route(
    '/api/tasks/<task_id>/submit',
    methods=['POST']
)
def submit_task(task_id):

    try:

        # Fetch existing task
        old_task = (
            supabase
            .table('tasks')
            .select('*')
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        if not old_task.data:

            return jsonify({
                "error":
                "Task not found"
            }), 404

        old_data = old_task.data[0]

        current_status = (
            old_data.get("status")
            or "assigned"
        )

        # Validate transition
        if current_status not in [
            "in_progress",
            "processing"
        ]:

            return jsonify({
                "error":
                f"Cannot submit task from status '{current_status}'"
            }), 400

        # Update task
        response = (
            supabase
            .table('tasks')
            .update({
                "status":
                    "submitted"
            })
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        updated_task = (
            response.data[0]
            if response.data
            else None
        )

        # Audit log
        create_audit_log(

            table_name='tasks',

            record_id=task_id,

            action='task_submitted',

            old_data=old_data,

            new_data=updated_task,

            changed_by=
                old_data.get(
                    "assigned_to"
                )
        )
        send_email_notification(

    "task_submitted",

    recipient="admin@example.com",

    task_title=updated_task["title"]
)

        return jsonify({

            "status":
                "submitted",

            "task":
                updated_task

        }), 200

    except Exception as e:

        print(
            f"[SUBMIT TASK ERROR]: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# ACCEPT TASK
@app.route(
    '/api/tasks/<task_id>/accept',
    methods=['PUT']
)
def accept_task(task_id):

    try:

        # Fetch existing task
        old_task = (
            supabase
            .table('tasks')
            .select('*')
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        if not old_task.data:

            return jsonify({
                "error":
                "Task not found"
            }), 404

        old_data = old_task.data[0]

        current_status = (
            old_data.get("status")
            or "assigned"
        )

        # Validate transition
        if current_status != "submitted":

            return jsonify({
                "error":
                f"Cannot accept task from status '{current_status}'"
            }), 400

        # Update task
        response = (
            supabase
            .table('tasks')
            .update({
                "status":
                    "accepted"
            })
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        updated_task = (
            response.data[0]
            if response.data
            else None
        )

        # Audit log
        create_audit_log(

            table_name='tasks',

            record_id=task_id,

            action='task_accepted',

            old_data=old_data,

            new_data=updated_task
        )
        send_email_notification(

    "task_accepted",

    recipient="user@example.com",

    task_title=updated_task["title"]
)

        return jsonify({

            "status":
                "accepted",

            "task":
                updated_task

        }), 200

    except Exception as e:

        print(
            f"[ACCEPT TASK ERROR]: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# Request Revision
@app.route(
    '/api/tasks/<task_id>/request-revision',
    methods=['PUT']
)
def request_revision(task_id):

    try:

        # Fetch existing task
        old_task = (
            supabase
            .table('tasks')
            .select('*')
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        if not old_task.data:

            return jsonify({
                "error":
                "Task not found"
            }), 404

        old_data = old_task.data[0]

        current_status = (
            old_data.get("status")
            or "assigned"
        )

        # Validate transition
        if current_status != "submitted":

            return jsonify({
                "error":
                f"Cannot request revision from status '{current_status}'"
            }), 400

        # Update task
        response = (
            supabase
            .table('tasks')
            .update({
                "status":
                    "revision_requested"
            })
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        updated_task = (
            response.data[0]
            if response.data
            else None
        )

        # Audit log
        create_audit_log(

            table_name='tasks',

            record_id=task_id,

            action='revision_requested',

            old_data=old_data,

            new_data=updated_task
        )
        send_email_notification(

    "revision_requested",

    recipient="user@example.com",

    task_title=updated_task["title"]
)
        return jsonify({

            "status":
                "revision_requested",

            "task":
                updated_task

        }), 200

    except Exception as e:

        print(
            f"[REVISION ERROR]: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# DELETE TASK
@app.route(
    '/api/tasks/<task_id>',
    methods=['DELETE']
)
def delete_task(task_id):

    try:

        # Fetch task before deletion
        old_task = (
            supabase
            .table('tasks')
            .select('*')
            .eq(
                "id",
                str(task_id)
            )
            .execute()
        )

        old_data = (
            old_task.data[0]
            if old_task.data
            else None
        )

        # Delete generated images
        (
            supabase
            .table('generated_images')
            .delete()
            .eq(
                'task_id',
                str(task_id)
            )
            .execute()
        )

        # Delete task
        response = (
            supabase
            .table('tasks')
            .delete()
            .eq(
                'id',
                str(task_id)
            )
            .execute()
        )

        # Audit log
        create_audit_log(

            table_name='tasks',

            record_id=task_id,

            action='task_deleted',

            old_data=old_data
        )

        return jsonify({

            "status":
                "deleted",

            "task":
                response.data

        }), 200

    except Exception as e:

        print(
            f"[DELETE TASK ERROR]: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500
    
@app.route(
    '/api/generations/<generation_id>/regenerate',
    methods=['POST']
)
def regenerate_generation(
    generation_id
):

    try:

        generation = (
            supabase
            .table('generated_images')
            .select('*')
            .eq(
                "id",
                generation_id
            )
            .execute()
        )

        if not generation.data:

            return jsonify({
                "error":
                "Generation not found"
            }), 404

        generation_data = (
            generation.data[0]
        )

        task_id = (
            generation_data["task_id"]
        )

        image_type = (
            generation_data["image_type"]
        )

        # Delete old image
        (
            supabase
            .table('generated_images')
            .delete()
            .eq(
                "id",
                generation_id
            )
            .execute()
        )

        # Trigger celery regeneration
        job = generate_all_variations.delay(
            task_id,
            single_variation=image_type
        )

        create_audit_log(

            table_name=
                'generated_images',

            record_id=
                generation_id,

            action=
                'generation_regenerated'
        )

        return jsonify({

            "status":
                "queued",

            "job_id":
                job.id

        }), 200

    except Exception as e:

        print(
            f"[REGENERATE ERROR]: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':

    app.run(
        port=5000,
        debug=True
    )