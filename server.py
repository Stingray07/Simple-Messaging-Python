from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send
import psycopg2


app = Flask(__name__)
app.config['SECRET_KEY'] = 'shhh'
socketio = SocketIO(app)


@app.route('/', methods=['POST', 'GET'])
def hello():
    if request.method == 'POST':
        data = request.json
        username = data['username']
        password = data['password']
        is_accessed = query(create_account=False, username=username, password=password)
        if is_accessed:
            return {
                'message': 'Authorized'
            }
        else:
            return {
                'message': 'Credentials not in database'
            }
    return render_template('index.html')


@app.route('/home', methods=['POST', 'GET'])
def home():
    return render_template('home.html')


@socketio.on("putangina")
def handle_message(data):
    print('Received message: ' + str(data))
    emit('response', data)

@socketio.on('my event')
def event(json):
    print('received json: ' + str(json))

@app.route('/create_account', methods=['POST', 'GET'])
def create_account():
    if request.method == 'POST':
        data = request.json
        username = data['username']
        password = data['password']
        result = query(create_account=True, username=username, password=password)
        if result == 'User Exists':
            return {
                'message': 'Username already exists'
            }
        else:
            return {
                'message': 'Account created'
            }

    return render_template('create_account.html')


def query(create_account, username, password):
    conn = psycopg2.connect(
        dbname='Accounts',
        user='postgres',
        password='gwaposting123',
        host='127.0.0.1',
        port=5432
    )
    cur = conn.cursor()
    
    if create_account:
        if username_exists(username=username, cur=cur):
            return 'User Exists'
        
        sql = f"INSERT INTO users (username, password) VALUES ('{username}', '{password}')"
        cur.execute(sql)

    else:
        return user_exists(username, password, cur)
        
    conn.commit()
    cur.close()
    conn.close()

def username_exists(username, cur):
    sql = f"SELECT * from users WHERE username = '{username}'"
    cur.execute(sql)
    result = cur.fetchone()

    if result:
        return True
    return False

def user_exists(username, password, cur):
    sql = f"SELECT * from users WHERE username = '{username}' and password = '{password}'"
    cur.execute(sql)
    result = cur.fetchone()

    if result:
        return True
    return False

if __name__ == '__main__':
    socketio.run(app, debug=True)
