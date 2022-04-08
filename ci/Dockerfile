FROM registry.access.redhat.com/ubi8/ubi:8.5-236.1648460182

ARG DEBIAN_FRONTEND=noninteractive

RUN groupadd --gid 1000 builduser \
  && useradd --uid 1000 --gid builduser --shell /bin/bash --create-home builduser \
  && mkdir -p /setup

# Set up TEMP directory
ENV TEMP=/tmp
RUN chmod a+rwx /tmp

# Install packages needed to run vscode headless
RUN yum update -q && yum install -y \
    yum-utils \
    git \
    iproute \
    fuse\
    vim \
    gdk-pixbuf2 \
    glibc-devel \
    gtk3\
    alsa-lib\
    libsecret \
    openssl-devel \
    libX11-devel \
    libXScrnSaver \
    mesa-libgbm\
    nss\
    at-spi2-atk\
    libX11-xcb \
    lsof \
    python3-pip \
    sudo \
    wget \
    unzip 

# Add centos8 to mirrorlist 
RUN yum-config-manager --add-repo https://vault.centos.org/centos/8/AppStream/x86_64/os

# Downloand and import CentOS8 GPG keys
RUN wget "https://centos.org/keys/RPM-GPG-KEY-CentOS-Official" \
  && rpm --import RPM-GPG-KEY-CentOS-Official

# No Sudo Prompt
RUN echo 'builduser ALL=NOPASSWD: ALL' >> /etc/sudoers.d/50-builduser  \
 && echo 'Defaults    env_keep += "DEBIAN_FRONTEND"' >> /etc/sudoers.d/env_keep

# Install Xvfb
RUN yum install xorg-x11-server-Xvfb -y

# Node
RUN curl -sL https://rpm.nodesource.com/setup_14.x | bash -
RUN yum install -y nodejs

# Set python3 as default
RUN alternatives --set python /usr/bin/python3

# Setup dbus path and config
RUN rm -rf /var/run/dbus && mkdir -p /var/run/dbus
COPY ci/dbus-policy.conf /etc/dbus-1/system.d/

# Copy entrypoint dbus-dameon script
COPY --chown=builduser:builduser ci/entrypoint.sh /etc/init.d/dbus-session
RUN chmod +x /etc/init.d/dbus-session

# Allow acccess to dbus socket for builduser
RUN chown builduser:builduser -R /var/run/dbus/
ENV DBUS_SESSION_BUS_ADDRESS="unix:path=/var/run/dbus/system_bus_socket"
ENV DISPLAY :99.0

COPY --chown=builduser:builduser . /home/builduser/

USER builduser
WORKDIR /home/builduser

ENTRYPOINT ["/etc/init.d/dbus-session"]
