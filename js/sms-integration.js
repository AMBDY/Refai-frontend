// SMS notifications via Termii
class SMSService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.ng.termii.com/api';
    }
    
    async sendSMS(phone, message) {
        const response = await fetch(`${this.baseUrl}/sms/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: this.apiKey,
                to: phone,
                from: 'RefAI',
                sms: message,
                type: 'plain',
                channel: 'generic'
            })
        });
        return await response.json();
    }
}
