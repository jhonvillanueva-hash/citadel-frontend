import { request } from '@playwright/test';

export default async () => {
  const api = await request.newContext();
  const apiUrl = process.env['BASE_URL'];

  const response = await api.post(
    `${apiUrl}/test/reset-db`
  );

  if (!response.ok()) {
    throw new Error(
      `Error reseteando BD: ${response.status()}`
    );
  }

  await api.dispose();
};