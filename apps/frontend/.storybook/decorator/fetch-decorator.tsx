import { useEffect } from 'react';

export const MockFetchDecorator = (StoryFn: any) => {
  useEffect(() => {
    const originalFetch = globalThis.fetch;

    const mockFetch: typeof fetch = async (input, init) => {
      // Normalizar la URL para registro/coincidencia
      const url = typeof input === 'string' 
        ? input 
        : input instanceof URL 
          ? input.toString() 
          : input.url;

      console.log(`Intercepted fetch call to: ${url}`);

      // Mock para la ruta de login
      if (url.includes('/api/auth/login')) {
        // Extraer el cuerpo de la petición
        let body: any = {};
        try {
          if (init?.body) {
            body = typeof init.body === 'string' 
              ? JSON.parse(init.body) 
              : init.body instanceof URLSearchParams 
                ? Object.fromEntries(init.body.entries())
                : {};
          }
        } catch (e) {
          console.error('Error parsing request body:', e);
        }

        // Simular credenciales inválidas
        if (body.password === 'invalid') {
          return new Response(
            JSON.stringify({ error: "Invalid credentials" }), 
            {
              status: 401,
              statusText: "Unauthorized",
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

        // Simular login exitoso
        return new Response(
          JSON.stringify({
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
            user: {
              id: 1,
              name: "John Doe",
              email: body.userName || "test@example.com",
              role: "admin"
            }
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Para otras URLs, devolver error 404
      return new Response(
        JSON.stringify({ error: "Not found" }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    };

    globalThis.fetch = mockFetch;

    return () => {
      globalThis.fetch = originalFetch;
    };
  }, []);

  return <StoryFn />;
};