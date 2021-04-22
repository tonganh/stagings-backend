# 社員の管理に対するウェブサイトのアプリケーション説明


このプロジェクトに対する技術を使っているのは：
- フロントエンド: [React](https://facebook.github.io/react/)や[Umi](https://github.com/umijs/umi)、他には[Ant-Design](https://github.com/ant-design/ant-design)
- バックエンド:
    - フレームうーく: [Express](http://expressjs.com/)
    - データベース：[Mongoose](http://mongoosejs.com/)
    - ストレージ:[MinIO](https://min.io/)

１ステージが終了しました。現在、このウェブサイトは社員情報、プロジェック、給与、レボート情報を管理する機能があります。
現在チーム開発中で、バックエンドを担当しています。 今、私のチームは　２ ステージ を開発しています。


## db.js でデータベース接続を調整したことを確認してください

- [Node.js](https://nodejs.org/en/) 6+

```shell
yarn
```


## Running

db.js でデータベース接続を調整したことを確認してください

製品 モッド:

```shell
yarn start
```

Development (Webpack dev server) mode:

```shell
yarn start:dev
```


プログラムを実行するには、db.jsでデータベース接続を設定する必要があります。

Usecase UML:
![feature-image](https://github.com/tonganh/stagings-backend/blob/d65d3479007c4dfbe2db4f6d70caae8162f024ca/useCase.png)
