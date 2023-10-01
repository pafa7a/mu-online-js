openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365 -addext "subjectAltName = IP:192.168.0.168,IP:127.0.0.1"
openssl rsa -in keytmp.pem -out key.pem
rm keytmp.pem
