deploy:
	gcloud run deploy ml-backend --source . \
		--allow-unauthenticated \
		--region us-central1 \
		--add-volume name=model_mnt,type=cloud-storage,bucket=dicoding-ml-storage \
		--add-volume-mount volume=model_mnt,mount-path=/workspace/models