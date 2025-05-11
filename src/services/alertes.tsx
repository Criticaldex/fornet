import _ from "lodash"

export const sendTelegram = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sendTelegram`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: "TestMqtt Message brotha"
            }),
        });
        if (!response.ok) throw new Error("Failed to send");
        console.log("Mensaje enviado!");
    } catch (err) {
        console.error("Error:", err);
    }
}

export const sendMail = async () => {

}