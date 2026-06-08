import os
from flask import Flask,request,jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app)

url:str = os.environ.get("SUPABASE_URL")
key:str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}),200

if __name__ == '__main__':
    app.run(debug=True,port = 5000)

