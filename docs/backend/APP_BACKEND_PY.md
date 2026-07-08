# 生肖天机 - Flask 后端代码

## 文件位置

所有后端代码位于：`/opt/shengxiao/`

```
/opt/shengxiao/
├── app.py              ← 主程序（本文档内容）
├── config.py           ← 配置文件（环境变量）
├── requirements.txt    ← Python 依赖
└── api.log             ← 运行日志
```

## requirements.txt

```
flask>=3.0.0
flask-cors>=5.0.0
pymysql>=1.1.0
pyjwt>=2.8.0
requests>=2.31.0
python-dotenv>=1.0.0
redis>=5.0.0
```

## config.py（环境变量配置）

```python
import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    # 数据库
    DB_HOST     = os.getenv("DB_HOST", "rm-xxxx-pub.mysql.rds.aliyuncs.com")
    DB_PORT     = int(os.getenv("DB_PORT", 3306))
    DB_USER     = os.getenv("DB_USER", "root")
    DB_PASS     = os.getenv("DB_PASS", "")
    DB_NAME     = os.getenv("DB_NAME", "shengxiao")

    # JWT
    JWT_SECRET  = os.getenv("JWT_SECRET", "your-secret-key-change-me")
    JWT_EXPIRE  = int(os.getenv("JWT_EXPIRE", 86400 * 30))  # 30天

    # 微信
    WECHAT_APPID    = os.getenv("WECHAT_APPID", "")
    WECHAT_SECRET   = os.getenv("WECHAT_SECRET", "")

    # 抖音
    DOUYIN_APPID    = os.getenv("DOUYIN_APPID", "")
    DOUYIN_SECRET   = os.getenv("DOUYIN_SECRET", "")

    # 快手
    KUAISHOU_APPID  = os.getenv("KUAISHOU_APPID", "")
    KUAISHOU_SECRET = os.getenv("KUAISHOU_SECRET", "")

    # 服务器
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
```

---

## app.py（完整代码）

```python
"""
生肖天机 - 云端后端 API v2（支持多平台登录）
Flask + MySQL（阿里云 RDS）+ JWT
"""
import json, time, functools, secrets, hashlib, requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import jwt

# ── 配置 ──────────────────────────────────────────────
app = Flask(__name__)
CORS(app, supports_credentials=True)

DB_HOST  = "rm-m5e3c29lzp37083us-pub.mysql.rds.aliyuncs.com"
DB_USER  = "root"
DB_PASS  = "Fuofuo230"
DB_NAME  = "shengxiao"
JWT_SECRET = "sx_jwt_secret_2026_change_me"
JWT_EXPIRE = 86400 * 30  # 30天

# 平台 app 配置（生产环境从环境变量读取）
PLATFORMS = {
    "wechat":   {"appid": "", "secret": ""},
    "douyin":   {"appid": "", "secret": ""},
    "kuaishou": {"appid": "", "secret": ""},
}

# ── 数据库 ───────────────────────────────────────────
def get_conn():
    return pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASS,
        database=DB_NAME, charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=10, read_timeout=30, write_timeout=30
    )

# ── JWT 工具 ────────────────────────────────────────
def make_token(player_id):
    payload = {
        "player_id": player_id,
        "exp": time.time() + JWT_EXPIRE,
        "iat": time.time(),
        "jti": secrets.token_hex(8)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["player_id"]
    except jwt.ExpiredSignatureError:
        return None
    except Exception:
        return None

def require_auth(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"code": 401, "msg": "请先登录"})
        player_id = verify_token(token)
        if not player_id:
            return jsonify({"code": 401, "msg": "登录已过期，请重新登录"})
        request.player_id = player_id
        return f(*args, **kwargs)
    return decorated

# ── 平台登录 ─────────────────────────────────────────
def get_platform_openid(platform, code):
    """用 code 换 openid（各平台通用接口）"""
    cfg = PLATFORMS.get(platform)
    if not cfg or not cfg["appid"]:
        # 开发/测试模式：用 code 本身做 openid（模拟）
        return code

    if platform == "wechat":
        url = "https://api.weixin.qq.com/sns/jscode2session"
        params = {"appid": cfg["appid"], "secret": cfg["secret"],
                  "js_code": code, "grant_type": "authorization_code"}
    elif platform == "douyin":
        url = "https://open.douyin.com/oauth/access_token"
        params = {"client_key": cfg["appid"], "client_secret": cfg["secret"],
                  "code": code, "grant_type": "authorization_code"}
    # ... 其他平台类似
    else:
        return None

    try:
        r = requests.get(url, params=params, timeout=5)
        data = r.json()
        if platform == "wechat":
            return data.get("openid")
        elif platform == "douyin":
            return data.get("open_user_info", {}).get("openid")
    except Exception:
        return None

# ── API：平台登录 ───────────────────────────────────
@app.route("/api/auth/<platform>", methods=["POST"])
def platform_login(platform):
    """通用平台登录（微信/抖音/快手/web）"""
    data = request.json or {}
    code = data.get("code", "").strip()
    nickname = data.get("nickname", "")
    avatar_url = data.get("avatar_url", "")

    if not code:
        return jsonify({"code": 400, "msg": "缺少 code 参数"})

    # 换 openid
    openid = get_platform_openid(platform, code)
    if not openid:
        return jsonify({"code": 401, "msg": "code 无效或已过期"})

    conn = get_conn()
    try:
        cur = conn.cursor()

        # 查该平台 openid 是否已注册
        col = f"{platform}_openid"
        if col not in ["wechat_openid", "douyin_openid", "kuaishou_openid"]:
            return jsonify({"code": 400, "msg": "不支持的平台"})

        cur.execute(f"SELECT id FROM players WHERE {col}=%s", (openid,))
        row = cur.fetchone()
        is_new = False

        if row:
            # 已注册，直接登录
            player_id = row["id"]
        else:
            # 新用户，创建账号
            cur.execute("""
                INSERT INTO players (primary_platform, primary_openid, nickname, avatar_url, last_login)
                VALUES (%s, %s, %s, %s, NOW())
            """, (platform, openid, nickname[:64], avatar_url[:512]))
            player_id = cur.lastrowid

            # 初始化存档
            init_data = {
                "coins": 0, "totalCoinsEarned": 0, "dragons": [], "mergeCount": 0,
                "summonCount": 0, "zodiac": -1, "fate": -1, "dragonQi": 0,
                "achievements": [], "unlockedAtlas": [], "signDays": 0,
                "cultivation": {"mu": 0, "huo": 0, "tu": 0, "kin": 0, "shui": 0}
            }
            cur.execute("""
                INSERT INTO player_data (player_id, game_data, total_coins, max_dragon_level)
                VALUES (%s, %s, 0, 0)
            """, (player_id, json.dumps(init_data, ensure_ascii=False)))

            is_new = True

        # 更新最后登录
        cur.execute("UPDATE players SET last_login=NOW() WHERE id=%s", (player_id,))
        conn.commit()

        # 生成 token
        token = make_token(player_id)

        # 读取存档
        cur.execute("SELECT game_data FROM player_data WHERE player_id=%s", (player_id,))
        gd_row = cur.fetchone()
        game_data = json.loads(gd_row["game_data"]) if gd_row else {}

        return jsonify({
            "code": 0, "msg": "登录成功",
            "data": {
                "player_id": player_id,
                "token": token,
                "is_new": is_new,
                "game_data": game_data
            }
        })
    finally:
        conn.close()

# ── API：Web 端登录（手机号）─────────────────────────
@app.route("/api/auth/web", methods=["POST"])
def web_login():
    """Web 端手机号注册/登录"""
    data = request.json or {}
    phone = data.get("phone", "").strip()
    password = data.get("password", "")

    if not phone or not password:
        return jsonify({"code": 400, "msg": "手机号和密码不能为空"})
    if len(phone) != 11 or not phone.isdigit():
        return jsonify({"code": 400, "msg": "手机号格式错误"})

    pw_hash = hashlib.sha256(password.encode()).hexdigest()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, nickname FROM players WHERE phone=%s AND password_hash=%s",
                    (phone, pw_hash))
        row = cur.fetchone()

        if row:
            player_id = row["id"]
        else:
            # 检查是否已注册（无密码）
            cur.execute("SELECT id FROM players WHERE phone=%s", (phone,))
            existing = cur.fetchone()
            if existing:
                return jsonify({"code": 409, "msg": "该手机号已注册，请直接登录"})

            cur.execute("""
                INSERT INTO players (phone, password_hash, primary_platform, primary_openid, last_login)
                VALUES (%s, %s, 'web', %s, NOW())
            """, (phone, pw_hash, f"web_{phone}"))
            player_id = cur.lastrowid

            init_data = {
                "coins": 0, "totalCoinsEarned": 0, "dragons": [], "mergeCount": 0,
                "summonCount": 0, "zodiac": -1, "fate": -1, "dragonQi": 0,
                "achievements": [], "unlockedAtlas": [], "signDays": 0,
                "cultivation": {"mu": 0, "huo": 0, "tu": 0, "kin": 0, "shui": 0}
            }
            cur.execute("""
                INSERT INTO player_data (player_id, game_data, total_coins, max_dragon_level)
                VALUES (%s, %s, 0, 0)
            """, (player_id, json.dumps(init_data, ensure_ascii=False)))

        cur.execute("UPDATE players SET last_login=NOW() WHERE id=%s", (player_id,))
        conn.commit()

        token = make_token(player_id)
        cur.execute("SELECT game_data FROM player_data WHERE player_id=%s", (player_id,))
        gd = cur.fetchone()

        return jsonify({
            "code": 0, "msg": "成功",
            "data": {
                "player_id": player_id,
                "token": token,
                "game_data": json.loads(gd["game_data"]) if gd else {}
            }
        })
    finally:
        conn.close()

# ── API：存档保存（需认证）───────────────────────────
@app.route("/api/game/save", methods=["POST"])
@require_auth
def save_game():
    """保存游戏存档"""
    data = request.json or {}
    game_data = data.get("game_data", {})

    if isinstance(game_data, str):
        try:
            game_data = json.loads(game_data)
        except:
            return jsonify({"code": 400, "msg": "game_data 格式错误"})

    player_id = request.player_id
    coins = game_data.get("coins", 0)
    dragons = game_data.get("dragons", [])
    max_level = max([d.get("level", 0) for d in dragons], default=0)
    total_coins = game_data.get("totalCoinsEarned", coins)
    merge_count = game_data.get("mergeCount", 0)
    summon_count = game_data.get("summonCount", 0)

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO player_data
                (player_id, game_data, total_coins, max_dragon_level,
                 total_merge, total_summon, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE
                game_data = VALUES(game_data),
                total_coins = GREATEST(total_coins, VALUES(total_coins)),
                max_dragon_level = GREATEST(max_dragon_level, VALUES(max_dragon_level)),
                total_merge = VALUES(total_merge),
                total_summon = VALUES(total_summon),
                data_version = data_version + 1,
                updated_at = NOW()
        """, (player_id, json.dumps(game_data, ensure_ascii=False),
              total_coins, max_level, merge_count, summon_count))
        conn.commit()

        cur.execute("SELECT data_version FROM player_data WHERE player_id=%s", (player_id,))
        version = cur.fetchone()["data_version"]

        return jsonify({"code": 0, "msg": "保存成功", "data_version": version})
    finally:
        conn.close()

# ── API：存档读取（需认证）───────────────────────────
@app.route("/api/game/load", methods=["GET"])
@require_auth
def load_game():
    """读取游戏存档"""
    player_id = request.player_id
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT game_data, total_coins, max_dragon_level,
                   total_merge, total_summon, updated_at
            FROM player_data WHERE player_id=%s
        """, (player_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"code": 404, "msg": "存档不存在"})

        return jsonify({
            "code": 0, "msg": "读取成功",
            "data": {
                "game_data": json.loads(row["game_data"]),
                "total_coins": row["total_coins"],
                "max_level": row["max_dragon_level"],
                "total_merge": row["total_merge"],
                "total_summon": row["total_summon"],
                "updated_at": str(row["updated_at"])
            }
        })
    finally:
        conn.close()

# ── 排行榜 ───────────────────────────────────────────
@app.route("/api/rank/coins", methods=["GET"])
def rank_coins():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT pd.total_coins, pd.max_dragon_level, p.nickname, p.avatar_url
            FROM player_data pd
            JOIN players p ON p.id = pd.player_id
            WHERE p.status = 1
            ORDER BY pd.total_coins DESC LIMIT 50
        """)
        rows = cur.fetchall()
        return jsonify({"code": 0, "list": [_mask_row(r) for r in rows]})
    finally:
        conn.close()

@app.route("/api/rank/level", methods=["GET"])
def rank_level():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT pd.max_dragon_level, pd.total_coins, p.nickname, p.avatar_url
            FROM player_data pd
            JOIN players p ON p.id = pd.player_id
            WHERE p.status = 1
            ORDER BY pd.max_dragon_level DESC LIMIT 50
        """)
        rows = cur.fetchall()
        return jsonify({"code": 0, "list": [_mask_row(r) for r in rows]})
    finally:
        conn.close()

@app.route("/api/rank/me", methods=["GET"])
@require_auth
def rank_me():
    """获取当前玩家的排名"""
    player_id = request.player_id
    conn = get_conn()
    try:
        cur = conn.cursor()
        # 金币排名
        cur.execute("""
            SELECT COUNT(*) + 1 as rank FROM player_data pd
            JOIN players p ON p.id = pd.player_id
            WHERE p.status = 1 AND pd.total_coins > (
                SELECT total_coins FROM player_data WHERE player_id=%s
            )
        """, (player_id,))
        coin_rank = cur.fetchone()["rank"]

        return jsonify({
            "code": 0,
            "coin_rank": coin_rank,
            "player_id": player_id
        })
    finally:
        conn.close()

def _mask_row(row):
    """昵称脱敏，微信昵称可能是 emoji"""
    nickname = row.get("nickname") or ""
    # 只保留首字符
    masked = nickname[:1] + "**" if nickname else "匿名"
    return {
        "nickname": masked,
        "avatar_url": row.get("avatar_url") or "",
        "total_coins": row.get("total_coins", 0),
        "max_level": row.get("max_dragon_level", 0)
    }

# ── 健康检查 ─────────────────────────────────────────
@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"code": 0, "msg": "pong", "time": time.time()})

# ── 启动 ─────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
```
