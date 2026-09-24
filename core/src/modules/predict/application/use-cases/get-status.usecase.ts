import { Injectable } from '@nestjs/common';

@Injectable()
export class GetStatusUseCase {
  execute(): { status: string; model_loaded: boolean; version: string } {
    return { status: 'ok', model_loaded: true, version: 'v3' };
  }
}