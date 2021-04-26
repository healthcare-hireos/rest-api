import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';
import { DbConfig } from './db-configuration';

export interface JSONWebTokenConfig {
  secret: string;
  signOptions: {
    expiresIn: number;
  };
}

export interface AWSConfig {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bucket: {
    name: string;
  };
  region: string;
}

export interface MailgunConfig {
  apiKey: string,
  domain: string
}

export interface TpayConfig {
    url: string,
    id: string,
    api_password: string,
    api_key: string,
    security_code: string
}


export interface ConfigI {
  database: ConnectionOptions | TypeOrmModuleOptions;
  jwt: JSONWebTokenConfig;
  aws: AWSConfig;
  mailgun: MailgunConfig;
  tpay: any;
}

export default (): ConfigI => ({
  database: DbConfig,
  jwt: {
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: 3600,
    },
  },
  aws: {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    bucket: {
      name: process.env.S3_BUCKET_NAME,
    },
    region: 'eu-west-2',
  },
  mailgun: {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
  },
  tpay: {
    url: process.env.TPAY_API_URL,
    id: process.env.TPAY_ID,
    api_password: process.env.TPAY_API_PASSWORD,
    api_key: process.env.TPAY_API_KEY,
    security_code: process.env.TPAY_SECURITY_CODE
  }
});
