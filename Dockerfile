FROM alpine

ARG BUILDARCH
WORKDIR /app

# apk 替换国内镜像源
RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirrors.aliyun.com|g' /etc/apk/repositories
# 安装 tzdata 和 wget
RUN apk add --no-cache tzdata wget

# 下载并安装 glibc, 下面gcompat是alpine镜像下的glibc兼容层，而再次覆盖式安装glibc-2.35-r0.apk 是为了解决后续其他的问题
RUN wget -q https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub -O /etc/apk/keys/sgerrand.rsa.pub && \
    wget -q https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r0/glibc-2.35-r0.apk && \
    apk add gcompat && \
    apk add --no-cache --force-overwrite glibc-2.35-r0.apk && \
    rm glibc-2.35-r0.apk

# 复制应用程序文件
COPY ./${BUILDARCH}/release /app/

# 设置卷
VOLUME /app/data

# 暴露端口
EXPOSE 21114

# 设置启动命令
CMD ["./apimain"]