import json
import os
import urllib.error
import urllib.request

from fastapi import FastAPI, Request, HTTPException
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import MessageEvent, TextMessage, TextSendMessage

app = FastAPI()

LINE_CHANNEL_ACCESS_TOKEN = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN")
LINE_CHANNEL_SECRET = os.environ.get("LINE_CHANNEL_SECRET")
ORDER_API_URL = os.environ.get("ORDER_API_URL", "http://127.0.0.1:8000/api/v1/catalog/requests")

line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)

# 這裡是睿程生醫專屬的 FAQ 資料庫
# Key 必須與圖文選單設定的「文字」一字不漏地完全相同
faq_data = {
    "申請平台帳密": (
        "您好！感謝您對睿程生醫 3D 醫療網站的興趣。\n\n"
        "請在此對話框留下您的「醫療機構代碼」與「聯絡人姓名」，"
        "我們的專員確認後，將盡快為您開通專屬帳號與密碼。\n\n"
        "👉 您也可以直接點擊選單右側的「前往官網」進行線上快速註冊喔！"
    ),
    "常見FAQ": (
        "這裡是睿程生醫的常見問題整理：\n\n"
        "1️⃣ 【支援格式】平台支援哪些 3D 模型格式？\n"
        "2️⃣ 【申請進度】帳號申請通常需要多久？\n"
        "3️⃣ 【技術支援】系統連線異常或 3D 模型跑不動怎麼辦？\n\n"
        "💡 請直接輸入您想詢問的「數字」或「問題關鍵字」，或直接輸入您的問題由專人為您解答！"
    ),
    # 這裡可以繼續擴充針對上述 1, 2, 3 點的精準回覆
    "1": "目前我們平台支援常見的 OBJ, STL, 以及優化過後的 GLTF/GLB 格式，以確保在網頁端有最流暢的 3D 檢視體驗。",
    "2": "一般情況下，收到您的醫療機構代碼後，我們會在 1-2 個工作天內完成人工審核並配發帳號。",
    "3": "若遇到模型讀取緩慢，建議先清除瀏覽器快取。若問題持續，請留下您的診所名稱，技術人員會協助您排解。"
}


def _line_user_id(event):
    source = getattr(event, "source", None)
    return getattr(source, "user_id", None) or "unknown"


def _post_order_message(event, user_text, request_type):
    user_id = _line_user_id(event)
    payload = {
        "requester_name": "LINE 使用者",
        "organization": "LINE Bot",
        "email": f"line-{user_id}@order.local",
        "phone": None,
        "quantity": 1,
        "message": user_text,
        "request_source": "linebot",
        "request_type": request_type,
        "preferred_contact": "LINE",
        "line_user_id": user_id,
    }
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        ORDER_API_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=3) as response:
            response.read()
        return True
    except (urllib.error.URLError, TimeoutError):
        return False

@app.post("/callback")
async def callback(request: Request):
    # 取得 LINE 傳來的簽章
    signature = request.headers.get("X-Line-Signature")
    body = await request.body()
    body_str = body.decode("utf-8")

    try:
        # 將訊息交給 handler 處理
        handler.handle(body_str, signature)
    except InvalidSignatureError:
        raise HTTPException(status_code=400, detail="Invalid signature. 請確認你的金鑰是否正確。")

    return "OK"

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    # 取得用戶傳來的文字
    user_text = event.message.text.strip() # .strip() 可以防呆，去除用戶不小心多打的空白鍵
    
    # 判斷用戶輸入的文字是否有在我們的資料庫中
    order_keywords = ("訂購", "我要訂購", "下單", "購買", "買", "產品")

    if user_text in faq_data:
        # 如果有，就抓出對應的答案
        reply_text = faq_data[user_text]
    elif any(keyword in user_text for keyword in order_keywords):
        saved = _post_order_message(event, user_text, "order")
        reply_text = (
            "已收到您的產品訂購需求，專人會透過 LINE 或電話與您確認產品、數量、交期與報價。\n\n"
            "若方便，請再補充：產品名稱、數量、聯絡電話。"
        )
        if not saved:
            reply_text += "\n\n目前訂單系統暫時無法連線，但您的 LINE 訊息仍在對話紀錄中，請稍候專人確認。"
    else:
        # 如果沒有，就觸發預設的人工客服通知
        saved = _post_order_message(event, user_text, "message")
        reply_text = (
            "已收到您的訊息！系統已通知內部人員。\n\n"
            "目前客服較為忙碌，請稍候，我們將盡快由專員親自為您解答與服務。"
        )
        if not saved:
            reply_text += "\n\n目前內部訊息庫暫時無法連線，但您的 LINE 訊息仍在對話紀錄中。"
    
    # 將準備好的文字回傳給用戶
    line_bot_api.reply_message(
        event.reply_token,
        TextSendMessage(text=reply_text)
    )

if __name__ == "__main__":
    import uvicorn
    # 啟動伺服器，預設跑在 8000 port
    uvicorn.run(app, host="0.0.0.0", port=8000)
