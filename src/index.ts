export interface Env {
  R2_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const email = (formData.get('email') as string) || '';
      const name = (formData.get('name') as string) || '';
      const project = (formData.get('project') as string) || '';
      const notes = (formData.get('notes') as string) || '';

      if (!file) {
        return Response.json({ error: 'No file provided' }, { status: 400 });
      }

      // Sanitize filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const timestamp = Date.now();
      const key = `uploads/${timestamp}-${safeName}`;

      await env.R2_BUCKET.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
        },
        customMetadata: {
          email,
          name,
          project,
          notes,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      const ref = `RF-${timestamp.toString().slice(-6)}`;

      return new Response(
        JSON.stringify({
          success: true,
          ref,
          fileKey: key,
          fileName: file.name,
          fileSize: file.size,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (err) {
      return Response.json({ error: 'Upload failed', detail: String(err) }, { status: 500 });
    }
  },
};
