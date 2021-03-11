import { IncomingMessage, ServerResponse } from 'http';
import { parseRequest } from './_lib/parser';
import { getScreenshot } from './_lib/chromium';
import { getHtml } from './_lib/template';

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

// example API route: http://localhost:3000/2020%20Snoozefest.jpg?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fpuerh.wtf%2Fassets%2Fstatic%2Fapple-touch-icon.7b22250.d6c38f098e4cfe7492d30929042211dd.png&images=https%3A%2F%2Fres.cloudinary.com%2Fpu-erh%2Fimage%2Fupload%2Fv1612895806%2Ftea%2F2021%2FSnoozefest%2F63B60F99-5C28-4C00-9818-633EBA3A259D_iytjc2.jpg&widths=undefined&widths=500&heights=undefined&heights=500

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    try {
        const parsedReq = parseRequest(req);
        const html = getHtml(parsedReq);
        if (isHtmlDebug) {
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
        }
        const { fileType } = parsedReq;
        const file = await getScreenshot(html, fileType, isDev);
        res.statusCode = 200;
        res.setHeader('Content-Type', `image/${fileType}`);
        res.setHeader('Cache-Control', `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`);
        res.end(file);
    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>');
        console.error(e);
    }
}
