import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      status:"I'm currently booked for the next decade in pretending to be productive.",
      message:"The multiverse wouldn't have forgiven me if I didn't comply."
    };
  }
}
