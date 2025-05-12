# syntax=docker/dockerfile:1

# Set up the base image
FROM public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 AS aws-lambda-adapter
FROM denoland/deno:bin-2.3.1 AS deno_bin
FROM debian:bookworm-20230703-slim AS deno_runtime
COPY --from=aws-lambda-adapter /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=deno_bin /deno /usr/local/bin/deno
ENV PORT=8000
EXPOSE 8000
RUN mkdir /var/deno_dir
ENV DENO_DIR=/var/deno_dir

# Copy the function code
WORKDIR "/var/task"
COPY . /var/task

# add new user
RUN adduser --disabled-password --gecos "" deno &&\
  chown -R deno:deno /var/deno_dir &&\
  chown -R deno:deno /var/task
USER deno

# Fresh ahead-of-time build
RUN deno task build

# Warmup caches
#RUN timeout 10s deno run -A main.ts || [ $? -eq 124 ] || exit 1

CMD ["deno", "run", "-A", "main.ts"]
