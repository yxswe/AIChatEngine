## Project Summary
This project seperates the frontend and backend. On frontend side, it is based on next and has a bit server logics for server rendering component.

## Auth via supabase
Supabase supports "browser client" for middeleware, server, client.   
On client side, it uses zustand for management.

file path:
@lib/supabase/*

Potential problem: it relies on NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, not sure if it satisfies security requirements.

## Chat history
Chat history managemnet














