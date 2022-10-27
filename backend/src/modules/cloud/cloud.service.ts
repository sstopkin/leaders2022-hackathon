import { Injectable } from '@nestjs/common';
import { InjectS3 } from 'nestjs-s3';
import { S3 } from 'aws-sdk';
import { AppConfigService } from '../../core/config';

export enum S3PresignedUrlOperation {
  GET_OBJECT = 'getObject',
  PUT_OBJECT = 'putObject',
}

@Injectable()
export class CloudService {
  constructor(
    @InjectS3() private readonly s3: S3,
    private appConfigService: AppConfigService,
  ) {}

  DICOMS_PREFIX = 'dicoms';
  IMAGES_PREFIX = 'images';

  async getS3PresignedUrl(
    key: string,
    s3PresignedUrlOperation: S3PresignedUrlOperation,
  ): Promise<string> {
    const params = {
      Bucket: this.appConfigService.S3_BUCKET,
      Key: key,
      Expires: this.appConfigService.S3_PRESIGNED_URL_ACCESS_INTERVAL,
    };
    return await this.s3.getSignedUrlPromise(
      s3PresignedUrlOperation.valueOf(),
      params,
    );
  }

  async putObject(key: string, object?: Buffer | string) {
    await this.s3
      .putObject({
        Bucket: this.appConfigService.S3_BUCKET,
        Key: key,
        Body: object,
      })
      .promise();
  }

  async deleteFolder(path: string) {
    const bucket = this.appConfigService.S3_BUCKET;

    const listedObjectsList = await this.listObjects(bucket, path);
    for (const listedObjects of listedObjectsList) {
      if (listedObjects.length <= 0) {
        continue;
      }
      const deleteParams = {
        Bucket: bucket,
        Delete: {
          Objects: listedObjects.map(({ Key }) => ({
            Key: Key,
          })),
        },
      };
      await this.s3.deleteObjects(deleteParams).promise();
    }

    await this.s3
      .deleteObject({
        Bucket: bucket,
        Key: path,
      })
      .promise();
  }

  private async listObjects(
    Bucket: string,
    Prefix: string,
    data: S3.ObjectList[] = [],
    ContinuationToken: string | undefined = undefined,
  ): Promise<S3.ObjectList[]> {
    const response = await this.s3
      .listObjectsV2({ Bucket, Prefix, ContinuationToken })
      .promise();
    data.push(response.Contents);
    if (response.IsTruncated) {
      return this.listObjects(
        Bucket,
        Prefix,
        data,
        response.NextContinuationToken,
      );
    }
    return data;
  }

  async deleteObject(key: string) {
    await this.s3
      .deleteObject({
        Bucket: this.appConfigService.S3_BUCKET,
        Key: key,
      })
      .promise();
  }

  makePublicUrl(path: string): string {
    return encodeURI(
      `${this.appConfigService.API_EXTERNAL_URI}/${this.DICOMS_PREFIX}/redirect/?path=${path}`,
    );
  }
}
