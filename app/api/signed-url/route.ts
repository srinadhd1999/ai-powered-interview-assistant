import {NextResponse} from "next/server";

export async function GET() {
    const agentId = "uhcnhsWmhNsCn8Lv4V6u"
    const apiKey = "sk_07b3d4a992a6bb8e80cee548d2f635e7bd9f6b5246a9efe2"

    if (!agentId) {
        throw Error('AGENT_ID is not set')
    }
    if (!apiKey) {
        throw Error('XI_API_KEY is not set')
    }
    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
            {
                method: 'GET',
                headers: {
                    'xi-api-key': apiKey,
                }              
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get signed URL');
        }

        const data = await response.json();
        const signed_url = data.signed_url
        return NextResponse.json({ signedUrl: signed_url});
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
    }
}