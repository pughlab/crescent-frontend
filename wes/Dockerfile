FROM candig/toil:latest

WORKDIR /root

COPY mesos-wes.sh .
COPY requirements.txt .
COPY workflow-service workflow-service

RUN python3.7 -m pip install -U pip && python3.7 -m pip install -U setuptools==57.5.0
RUN python3.7 -m pip install -r requirements.txt

WORKDIR /root/workflow-service

RUN python3.7 setup.py install

WORKDIR /root

RUN chmod 755 mesos-wes.sh