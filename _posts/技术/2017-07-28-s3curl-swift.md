---
layout: post
title: 使用 s3curl 访问 OpenStack Swift
description: 使用 s3curl 访问 OpenStack Swift
category: 技术
---

OpenStack Swift 中的 swift3 middleware 使 Swift 兼容 AWS S3 的 API，毕竟相对于 Swift 来说，S3的用户可能更多，大家可能已经习惯于使用 S3 的众多工具来操作对象存储，其中 s3cmd 和 s3curl 是两个比较常用的s3命令行工具。s3cmd 相对于 s3curl 可能是更为上层的封装，更易于使用。但如果想通过 s3 rest api 的方式与 Swift 通信，那么 s3curl 是最佳选择。很多编程语言提供的 s3 sdk，在最后也都是转换成 rest api 的形式。正好今天给一个用户定位一个问题（该用户使用 PHP S3 SDK 访问我们的 Swift 服务）时用到了 s3curl，所以趁机总结一下。

以下操作都在 Ubuntu 系统进行。

## 安装 s3curl
```
$ apt-get install -y libdigest-hmac-perl zip tidy
$ wget http://s3.amazonaws.com/doc/s3-example-code/s3-curl.zip
$ unzip s3-curl.zip
$ cd s3-curl
$ chmod u+x s3curl.pl
```

## 配置 s3curl
直接修改`s3curl.pl`的如下内容：
```
# 指向 Swift 服务的地址
my @endpoints = ( 'object-storage.nz-wlg-2.catalystcloud.io' );
```

通过`openstack ec2 credentials list`获取自己的 ec2 Access 和 Secret，如果没有直接`openstack ec2 credentials create`创建即可。

新建`~/.s3curl`文件，内容为：
```
%awsSecretAccessKeys = (
    lingxian => {
        id => '<ec2 Access>',
        key => '<ec2 Secret>',
    },
);
```
你可以将 lingxian 替换成你喜欢的任意字符串，后面会被 s3-curl 命令引用。

## s3curl 使用
关于 s3curl 的使用可以参考[这里](https://github.com/basho/riak_cs/wiki/Using-s3curl)，我这里仅演示 multipart upload。在下面的命令中，我在 swift 创建了一个名为 lingxian-s3curl-test 的 container，同时在本地创建了一个12M的文件并将其分割为三个部分，使用 s3curl 工具将这三个部分上传到 swift 并通过 swift cli 查看。

```
$ CONTAINER=lingxian-s3curl-test
$ OBJECT=multipart-test

# 创建 container
$ ./s3curl.pl --id lingxian -- -s -X PUT https://object-storage.nz-wlg-2.catalystcloud.io:443/$CONTAINER

# 开始 multipart upload
$ ./s3curl.pl --id lingxian -- -s -X POST "https://object-storage.nz-wlg-2.catalystcloud.io:443/$CONTAINER/$OBJECT?uploads" | tidy -xml -indent -q
<?xml version='1.0' encoding='utf-8'?>
<InitiateMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <Bucket>lingxian-s3curl-test</Bucket>
  <Key>multipart-test</Key>
  <UploadId>
  YjU5MGM4YjQtMDA3ZC00ODAwLWE0MjQtZTZmM2Q0OTFmZjMy</UploadId>
</InitiateMultipartUploadResult>

# 记录返回的 UploadId
$ UPLOADID=YzVmNGZiMWMtN2IxYi00ZmM4LTljNDMtNzQ3ZTQ3ZDFiMjg1

# 创建文件并分割
$ dd if=/dev/zero of=12M_file bs=1M count=12
$ split -b 5M 12M_file -d -a 3 split_file

# 上传三个分割的文件
$ ./s3curl.pl --id lingxian --put split_file000 -- \
  -s "https://object-storage.nz-wlg-2.catalystcloud.io:443/$CONTAINER/$OBJECT?uploadId=$UPLOADID&partNumber=1"
$ ./s3curl.pl --id lingxian --put split_file001 -- \
  -s "https://object-storage.nz-wlg-2.catalystcloud.io:443/$CONTAINER/$OBJECT?uploadId=$UPLOADID&partNumber=2"
$ ./s3curl.pl --id lingxian --put split_file002 -- \
  -s "https://object-storage.nz-wlg-2.catalystcloud.io:443/$CONTAINER/$OBJECT?uploadId=$UPLOADID&partNumber=3"

# 创建描述文件，完成上传，其中文件的ETag可以使用 md5sum 命令获取
$ cat <<EOF > parts-def
<CompleteMultipartUpload>
  <Part>
    <PartNumber>1</PartNumber>
    <ETag>5f363e0e58a95f06cbe9bbc662c5dfb6</ETag>
  </Part>
  <Part>
    <PartNumber>2</PartNumber>
    <ETag>5f363e0e58a95f06cbe9bbc662c5dfb6</ETag>
  </Part>
  <Part>
    <PartNumber>3</PartNumber>
    <ETag>b2d1236c286a3c0704224fe4105eca49</ETag>
  </Part>
</CompleteMultipartUpload>
EOF
$ ./s3curl.pl --id lingxian --post parts-def -- \
  -s "https://object-storage.nz-wlg-2.catalystcloud.io:443/$CONTAINER/$OBJECT?uploadId=$UPLOADID"

# 如果在完成上传前想取消操作，则：
$ ./s3curl.pl --id lingxian -- -s -X DELETE https://object-storage.nz-wlg-2.catalystcloud.io:443/$CONTAINER/$OBJECT?uploadId=$UPLOADID

# 上传成功后，可以通过 swift 命令查看
$ swift list
lingxian-s3curl-test
lingxian-s3curl-test+segments
$ swift list lingxian-s3curl-test
multipart-test
$ swift list lingxian-s3curl-test+segments
multipart-test/YjU5MGM4YjQtMDA3ZC00ODAwLWE0MjQtZTZmM2Q0OTFmZjMy/1
multipart-test/YjU5MGM4YjQtMDA3ZC00ODAwLWE0MjQtZTZmM2Q0OTFmZjMy/2
multipart-test/YjU5MGM4YjQtMDA3ZC00ODAwLWE0MjQtZTZmM2Q0OTFmZjMy/3

# 还可以通过 swift rest api 获取 SLO 的 manifest 文件内容
$ curl -s -X GET -H 'X-Auth-Token: <TOKEN>' \
  https://object-storage.nz-wlg-2.catalystcloud.io:443/v1/AUTH_b23a5e41d1af4c20974bf58b4dff8e5a/lingxian-s3curl-test/multipart-test?multipart-manifest=get | python -m json.tool
[
    {
        "bytes": 5242880,
        "content_type": "application/octet-stream",
        "hash": "5f363e0e58a95f06cbe9bbc662c5dfb6",
        "last_modified": "2017-07-28T00:31:59.000000",
        "name": "/lingxian-s3curl-test+segments/multipart-test/YjU5MGM4YjQtMDA3ZC00ODAwLWE0MjQtZTZmM2Q0OTFmZjMy/1"
    },
    {
        "bytes": 5242880,
        "content_type": "application/octet-stream",
        "hash": "5f363e0e58a95f06cbe9bbc662c5dfb6",
        "last_modified": "2017-07-28T00:32:29.000000",
        "name": "/lingxian-s3curl-test+segments/multipart-test/YjU5MGM4YjQtMDA3ZC00ODAwLWE0MjQtZTZmM2Q0OTFmZjMy/2"
    },
    {
        "bytes": 2097152,
        "content_type": "application/octet-stream",
        "hash": "b2d1236c286a3c0704224fe4105eca49",
        "last_modified": "2017-07-28T00:41:51.000000",
        "name": "/lingxian-s3curl-test+segments/multipart-test/YjU5MGM4YjQtMDA3ZC00ODAwLWE0MjQtZTZmM2Q0OTFmZjMy/3"
    }
]
```