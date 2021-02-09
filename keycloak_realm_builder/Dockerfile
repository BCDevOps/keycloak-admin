FROM        quay.io/operator-framework/ansible-operator:v1.4.0

# Testing:
# RUN         pip --version
RUN         pip3 --version

# Upgrade ansible version:
USER        1001
# RUN         pip3 install --user --upgrade pip3
RUN         pip3 install --user --ignore-installed ansible==2.9.6
RUN         ansible --version

ENV         WEBHOOK_VERSION 2.6.9
USER        0
WORKDIR     /opt/
RUN         curl -L --silent -o webhook.tar.gz https://github.com/adnanh/webhook/releases/download/${WEBHOOK_VERSION}/webhook-linux-amd64.tar.gz && \
            tar -xzf webhook.tar.gz --strip 1 && \
            chmod +x webhook 

COPY        scripts/  .

# TODO:
# - Upgrade python version

# - Install idap dependencies
# RUN         pip install --upgrade pip && \
#             pip install python-ldap

# - Add ldap library
# COPY        library/ldap_search.py /usr/share/ansible/openshift

# Set permissions for OpenShift on webhook artifacts
RUN         chgrp -R 0 /opt && \
            chmod -R g+rwX /opt && \
            chmod 664 /etc/passwd 

VOLUME      ["/etc/webhook"]
EXPOSE      9000
# Need to source the script for env var to be available
ENTRYPOINT  ["./entrypoint.sh"]
