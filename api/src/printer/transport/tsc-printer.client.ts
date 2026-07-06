import { Injectable } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class TscPrinterClient {
  async send(ip: string, port: number, tspl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();

      const timeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Connection timeout'));
      }, 5000);

      client.connect(port, ip, () => {
        clearTimeout(timeout);

        client.write(tspl, 'ascii', (err?: Error | null) => {
          if (err) {
            client.destroy();
            reject(err);
          } else {
            client.end();
          }
        });
      });

      client.on('end', () => resolve());

      client.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  async testNetworkConnection(ip: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new net.Socket();

      const timeout = setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 3000);

      client.connect(port, ip, () => {
        clearTimeout(timeout);
        client.end();
        resolve(true);
      });

      client.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }
}
