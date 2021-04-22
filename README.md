# 社員の管理に対するウェブサイトのアプリケーション説明


このプロジェクトに対する技術を使っているのは：
- フロントエンドに対して[React](https://facebook.github.io/react/)や[Umi](https://github.com/umijs/umi)、他には[Ant-Design](https://github.com/ant-design/ant-design)を使っています。
- バックエンド に対して:
    - フレームうーく: [Express](http://expressjs.com/)
    - データベース：[Mongoose](http://mongoosejs.com/)
    - ストレージ:[MinIO](https://min.io/)

＃ フェーズ1は終了しました。 今、このサイトは可能は社員の管理、プロジェクト、給与、およびレポート情報。
社員の情報を管理するや、給料ボードを作ることができます。
1 ステージは終わりました。今、発達しています。ステージ1の自己啓発。 現在チーム開発中で、バックエンドを担当しています。
今、私のチームは　２ ステージ を開発しています。


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


プログラムを実行するには、db.jsでdb接続を設定する必要があります。 次に、実行：
Usecase UML:
![feature-image](https://github.com/tonganh/stagings-backend/blob/d65d3479007c4dfbe2db4f6d70caae8162f024ca/useCase.png)
