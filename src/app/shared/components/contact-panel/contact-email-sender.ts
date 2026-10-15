export interface SendContactEmailParams {
  accessKey: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  fetchFn?: typeof fetch;
}

export interface SendContactEmailResult {
  success: boolean;
  message?: string;
}

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Sends a contact form submission to Web3Forms via HTTPS REST API.
 * Designed for static SPAs without a backend or exposed secret credentials.
 */
export async function sendContactEmail(
  params: SendContactEmailParams,
): Promise<SendContactEmailResult> {
  const accessKey = params.accessKey.trim();
  if (!accessKey) {
    return {
      success: false,
      message: 'Web3Forms access key is missing.',
    };
  }

  const fetcher = params.fetchFn ?? globalThis.fetch.bind(globalThis);

  const payload = {
    access_key: accessKey,
    name: params.name.trim(),
    email: params.email.trim(),
    message: params.message.trim(),
    subject: params.subject?.trim() || `Contato via Portfólio - ${params.name.trim()}`,
    from_name: params.name.trim(),
    botcheck: '',
  };

  try {
    const response = await fetcher(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;

    if (response.ok && data?.success) {
      return {
        success: true,
        message: data.message ?? 'Email sent successfully',
      };
    }

    return {
      success: false,
      message: data?.message ?? `Submission failed with status ${response.status}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return {
      success: false,
      message,
    };
  }
}
