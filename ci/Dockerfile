FROM ubuntu:18.04

ARG DEBIAN_FRONTEND=noninteractive

RUN groupadd --gid 1000 builduser \
  && useradd --uid 1000 --gid builduser --shell /bin/bash --create-home builduser \
  && mkdir -p /setup

# Set up TEMP directory
ENV TEMP=/tmp
RUN chmod a+rwx /tmp

# Latest stable git
RUN apt-get update && apt-get install -y software-properties-common
RUN add-apt-repository ppa:git-core/ppa -y

RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    git \
    gnome-keyring \
    iproute2 \
    libfuse2 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libgl1 \
    libgtk-3.0 \
    libsecret-1-dev \
    libssl-dev \
    libx11-dev \
    libx11-xcb-dev \
    libxkbfile-dev \
    locales \
    lsb-release \
    lsof \
    dbus \
    python-dbus \
    python-pip \
    sudo \
    wget \
    xvfb \
    tzdata \
    unzip \
  && curl https://chromium.googlesource.com/chromium/src/+/HEAD/build/install-build-deps.sh\?format\=TEXT | base64 --decode | cat > /setup/install-build-deps.sh \
  && chmod +x /setup/install-build-deps.sh \
  && bash /setup/install-build-deps.sh --syms --no-prompt --no-chromeos-fonts --no-arm --no-nacl \
  && rm -rf /var/lib/apt/lists/*

# Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn

# No Sudo Prompt
RUN echo 'builduser ALL=NOPASSWD: ALL' >> /etc/sudoers.d/50-builduser \
  && echo 'Defaults    env_keep += "DEBIAN_FRONTEND"' >> /etc/sudoers.d/env_keep

# Dotnet
RUN wget -q https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN apt-get update && apt-get install -y dotnet-sdk-2.1

# Node
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get update && apt-get install -y nodejs 

# Set python3 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1
RUN python --version

# Setup dbus path
RUN mkdir -p /var/run/dbus
COPY --chown=builduser:builduser ci/entrypoint.sh /etc/init.d/dbus-session
RUN chmod +x /etc/init.d/dbus-session

USER builduser
WORKDIR /home/builduser
RUN sudo chown builduser:builduser -R /var/run/dbus/

COPY --chown=builduser:builduser . .

ENTRYPOINT ["/etc/init.d/dbus-session"]
