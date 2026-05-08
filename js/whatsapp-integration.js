/**
 * RefAI - WhatsApp Bot Integration
 * Sends match updates and player notifications via WhatsApp
 */

class WhatsAppBot {
    constructor(apiKey, apiEndpoint) {
        this.apiKey = apiKey;
        // Using UltraMsg (Nigerian-friendly WhatsApp API)
        this.apiEndpoint = apiEndpoint || 'https://api.ultramsg.com';
        this.instanceId = null;
    }

    // Initialize bot with instance ID
    init(instanceId) {
        this.instanceId = instanceId;
        console.log('✅ WhatsApp Bot initialized:', instanceId);
    }

    // Send match event notification
    async sendMatchEvent(phoneNumber, eventData) {
        const message = this.formatMatchEvent(eventData);
        return await this.sendMessage(phoneNumber, message);
    }

    // Format match event into WhatsApp message
    formatMatchEvent(eventData) {
        const { type, team, player, minute, score } = eventData;

        switch(type) {
            case 'GOAL':
                return `⚽ *GOAL!* \n\n` +
                       `${player} (${team}) ` +
                       `scores at ${minute}' \n\n` +
                       `Current Score: ${score}`;

            case 'YELLOW_CARD':
                return `🟨 *YELLOW CARD* \n\n` +
                       `${player} (${team}) \n` +
                       `at ${minute}'`;

            case 'RED_CARD':
                return `🟥 *RED CARD!* \n\n` +
                       `${player} (${team}) \n` +
                       `sent off at ${minute}'`;

            case 'SUBSTITUTION':
                return `🔄 *SUBSTITUTION* \n\n` +
                       `${team}: \n` +
                       `OUT: ${eventData.playerOut} \n` +
                       `IN: ${eventData.playerIn} \n` +
                       `at ${minute}'`;

            case 'HALF_TIME':
                return `⏱️ *HALF TIME* \n\n` +
                       `Score: ${score}`;

            case 'FULL_TIME':
                return `🏁 *FULL TIME* \n\n` +
                       `Final Score: ${score} \n\n` +
                       `View match highlights: ${eventData.highlightUrl}`;

            default:
                return `Match update at ${minute}'`;
        }
    }

    // Send player performance notification
    async sendPlayerStats(phoneNumber, playerData) {
        const { name, goals, assists, cards, matchDate } = playerData;

        const message = `⚽ *Your Match Performance* \n\n` +
                       `Hi ${name}! \n\n` +
                       `Here's your performance from ${matchDate}: \n\n` +
                       `Goals: ${goals} ⚽ \n` +
                       `Assists: ${assists} 🎯 \n` +
                       `Cards: ${cards.yellow || 0} 🟨 ${cards.red || 0} 🟥 \n\n` +
                       `View full stats: ${playerData.profileUrl}`;

        return await this.sendMessage(phoneNumber, message);
    }

    // Send team notification
    async sendTeamNotification(phoneNumbers, message) {
        const results = [];
        
        for (const phone of phoneNumbers) {
            try {
                const result = await this.sendMessage(phone, message);
                results.push({ phone, success: true });
            } catch (error) {
                results.push({ phone, success: false, error: error.message });
            }
        }

        return results;
    }

    // Send league registration confirmation
    async sendRegistrationConfirmation(phoneNumber, leagueData) {
        const { leagueName, registrationFee, dashboardUrl } = leagueData;

        const message = `🏆 *League Registration Confirmed!* \n\n` +
                       `League: ${leagueName} \n` +
                       `Fee Paid: ₦${registrationFee.toLocaleString()} \n\n` +
                       `Your dashboard is now active! \n` +
                       `Access it here: ${dashboardUrl} \n\n` +
                       `Start adding teams and scheduling matches. \n\n` +
                       `Need help? Reply with "HELP"`;

        return await this.sendMessage(phoneNumber, message);
    }

    // Send match reminder
    async sendMatchReminder(phoneNumbers, matchData) {
        const { homeTeam, awayTeam, kickoffTime, venue } = matchData;

        const message = `⏰ *Match Reminder* \n\n` +
                       `${homeTeam} vs ${awayTeam} \n\n` +
                       `🕐 Kickoff: ${kickoffTime} \n` +
                       `📍 Venue: ${venue} \n\n` +
                       `Watch live on RefAI: ${matchData.streamUrl}`;

        return await this.sendTeamNotification(phoneNumbers, message);
    }

    // Core send message function
    async sendMessage(phoneNumber, message) {
        if (!this.instanceId) {
            throw new Error('WhatsApp Bot not initialized. Call init() first.');
        }

        // Format phone number (remove +, spaces, dashes)
        const formattedPhone = phoneNumber.replace(/[^\d]/g, '');

        try {
            const response = await fetch(
                `${this.apiEndpoint}/${this.instanceId}/messages/chat`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: this.apiKey,
                        to: formattedPhone,
                        body: message,
                        priority: 10
                    })
                }
            );

            const data = await response.json();

            if (data.sent) {
                console.log('✅ WhatsApp message sent to:', formattedPhone);
                return { success: true, messageId: data.id };
            } else {
                console.error('❌ Failed to send WhatsApp message:', data);
                return { success: false, error: data.error };
            }

        } catch (error) {
            console.error('❌ WhatsApp API error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send image with caption
    async sendImage(phoneNumber, imageUrl, caption) {
        const formattedPhone = phoneNumber.replace(/[^\d]/g, '');

        try {
            const response = await fetch(
                `${this.apiEndpoint}/${this.instanceId}/messages/image`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: this.apiKey,
                        to: formattedPhone,
                        image: imageUrl,
                        caption: caption
                    })
                }
            );

            const data = await response.json();
            return { success: data.sent, messageId: data.id };

        } catch (error) {
            console.error('❌ Failed to send image:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export for use
window.WhatsAppBot = WhatsAppBot;

// Usage example:
/*
const bot = new WhatsAppBot('YOUR_API_KEY');
bot.init('YOUR_INSTANCE_ID');

// Send goal notification
bot.sendMatchEvent('2348012345678', {
    type: 'GOAL',
    team: 'Mainland FC',
    player: 'John Doe',
    minute: 23,
    score: '1-0'
});

// Send player stats
bot.sendPlayerStats('2348012345678', {
    name: 'John Doe',
    goals: 2,
    assists: 1,
    cards: { yellow: 0, red: 0 },
    matchDate: '2024-03-15',
    profileUrl: 'https://refai.com.ng/player/123'
});
*/

console.log('✅ WhatsApp Bot integration loaded');
