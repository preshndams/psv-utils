import { randomUUID } from "crypto";

import {
  ITopicConfig,
  Kafka,
  KafkaMessage,
  MessageSetEntry,
  Producer,
} from "kafkajs";

export const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
  sasl: {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: true,
});

const admin = kafka.admin();

export const startKafka = async (topics: [ITopicConfig]): Promise<void> => {
  await admin.connect();
  await admin.createTopics({ topics });
};

export const producer = kafka.producer();

export const publishMessage = async ({
  topic,
  message,
  producer,
}: {
  topic: string;
  message: {};
  producer: Producer;
}) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });

  producer.disconnect();
};

declare type readCallback = {
  message: KafkaMessage;
  topic: string;
  partition: number;
  getValue?: Function;
};

const getValue = ({ value }: MessageSetEntry): Record<string, any> => {
  return value ? (value = JSON.parse(value.toString())) : "";
};

export const readMessage = async ({
  topic,
  fromBeginning = false,
  cb,
}: {
  topic: string;
  fromBeginning?: boolean;
  cb(obj: readCallback): any;
}): Promise<void> => {
  const groupId = randomUUID();
  const consumer = kafka.consumer({
    groupId,
  });
  await consumer.subscribe({
    topic,
    fromBeginning,
  });
  consumer.run({
    eachMessage: async ({ message, topic, partition }) => {
      cb({ message, topic, partition, getValue });
    },
  });
};
