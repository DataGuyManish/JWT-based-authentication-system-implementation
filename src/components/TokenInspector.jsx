import { decodeToken } from '../utils/jwt';

export default function TokenInspector({ token }) {
  if (!token) return null;
  const [rawHeader, rawPayload, rawSignature] = token.split('.');
  const { header, payload } = decodeToken(token);

  return (
    <div className="card">
      <h2>Token anatomy</h2>
      <p className="muted">
        Every JWT is three base64url segments joined by dots. Anyone can decode the
        first two — they are not encrypted, only signed — which is why a token should
        never carry secrets in its payload.
      </p>

      <div className="token-string">
        <span className="seg-header">{rawHeader}</span>.
        <span className="seg-payload">{rawPayload}</span>.
        <span className="seg-signature">{rawSignature}</span>
      </div>

      <div className="token-grid">
        <div className="token-part">
          <span className="seg-dot seg-header" />
          <h3>Header</h3>
          <pre>{JSON.stringify(header, null, 2)}</pre>
        </div>
        <div className="token-part">
          <span className="seg-dot seg-payload" />
          <h3>Payload (claims)</h3>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </div>
        <div className="token-part">
          <span className="seg-dot seg-signature" />
          <h3>Signature</h3>
          <p className="muted small">
            HMAC-SHA256 of the header and payload, using a secret only the server should
            know. Verifying it proves the token wasn't tampered with after issue.
          </p>
        </div>
      </div>
    </div>
  );
}
