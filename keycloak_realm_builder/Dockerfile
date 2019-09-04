FROM        quay.io/operator-framework/ansible-operator:v0.8.1
ENV         WEBHOOK_VERSION 2.6.9
USER        0
WORKDIR     /opt/
RUN         curl -L --silent -o webhook.tar.gz https://github.com/adnanh/webhook/releases/download/${WEBHOOK_VERSION}/webhook-linux-amd64.tar.gz && \
            tar -xzf webhook.tar.gz --strip 1 && \
            chmod +x webhook 

COPY        scripts/  .

# Add ldap library
COPY        library/ldap_search.py /usr/share/ansible/openshift

# Install idap dependencies
RUN         pip install --upgrade pip && \
            pip install python-ldap

# Set permissions for OpenShift on webhook artifacts
RUN         chgrp -R 0 /opt && \
            chmod -R g+rwX /opt && \
            chmod 664 /etc/passwd 

VOLUME      ["/etc/webhook"]
EXPOSE      9000
# Need to source the script for env var to be available
ENTRYPOINT  ["./entrypoint.sh"]
