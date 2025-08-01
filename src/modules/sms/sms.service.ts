// src/sms/sms.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';


interface Vars {
  [key: string]: string;
}


@Injectable()
export class SmsService {

  constructor(
    private configService: ConfigService,
  ){}

  async sendSms(phone: string, pattern: string, vars: Vars): Promise<any> {
    try {
      const response = await axios.post('http://ippanel.com/api/select', {
        op: 'pattern',
        user: this.configService.get('Sms.username'),
        pass: this.configService.get('Sms.password'),
        fromNum: '3000505',
        toNum: phone,
        patternCode: pattern,
        inputData: [vars],
      });
      console.log('Response: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Error: ', error);
      throw error;
    }
  }
}