The Uploader is a full-stack web application that lets users upload, view, and search images enhanced with AI-powered tagging.

Upload Images → Users can upload photos directly through the gallery UI.

Automatic Tagging → Images are analyzed using AWS Rekognition, which generates labels (e.g., “dog”, “beach”, “city”).

Smart Search & Filter → Search or filter images by tags to quickly find what you’re looking for.

Gallery View → Browse images in a clean, responsive grid with support for detail modals.

**** Tech Stack ****

Frontend: Vue (Vite), TailwindCSS

Backend: Node/Express (or AWS Lambda)

Cloud Services: AWS S3 (storage), AWS Rekognition (AI tagging), DynamoDB (metadata storage)


**** Future Features ****

User authentication (Cognito)

Custom/manual tags alongside AI tags

Favorites & collections

Deployment with S3 + CloudFront and Serverless backend