1. **Install serverless framework via npm**
```bash
$ npm install -g serverless
```

2. **Set-up your AWS Credentials**

3. **Install npm packages**
```bash
$ npm install
```

4. **Edit config overrides for production deployment**
```bash
$ vi config/production.yaml
```

```yaml
stripe:
    test_sk: 'Stripe_Test_Secret_Key_here'
    live_sk: 'Stripe_Live_Secret_Key_here'
```

5. **Deploy!**
```bash:development
$ serverless deploy -v
```

or production
```bash:production
$ serverless deploy -v --stage production
```