import { SQSEvent } from "aws-lambda";
import { lambdaHandler } from './app';

const record = (body: string) => ({
    messageId: "059f36b4-87a3-44ab-83d2-661975830a7d",
    receiptHandle: "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
    attributes: {
        ApproximateReceiveCount: "1",
        SentTimestamp: "1545082649183",
        SenderId: "AIDAIENQZJOLO23YVJ4VO",
        ApproximateFirstReceiveTimestamp: "1545082649185"
    },
    messageAttributes: {},
    md5OfBody: "e4e68fb7bd0e697a0ae8f1bb342846b3",
    eventSource: "aws:sqs",
    eventSourceARN: "arn:aws:sqs:us-east-2:123456789012:my-queue",
    awsRegion: "us-east-2",
    body
});

describe("lambda", () => {
    test("empty input is rejected", async () => {
        const event: SQSEvent = {
            Records: []
        }

        const response = lambdaHandler(event);

        await expect(response).rejects.toThrow('No valid records');
    });

    test("input with non-JSON payload is rejected", async () => {
        const event: SQSEvent = {
            Records: [
                record(`this is not valid json`)
            ]
        }

        const response = lambdaHandler(event);

        await expect(response).rejects.toThrow('No valid messages');
    });

    test("input with unexpected JSON payload is rejected", async () => {
        const event: SQSEvent = {
            Records: [
                record(`{"hello":"world"}`)
            ]
        }

        const response = lambdaHandler(event);

        await expect(response).rejects.toThrow('No valid records');
    });

    test("input with mixed payloads is filtered", async () => {
        const event: SQSEvent = {
            Records: [
                record(`{"hello":"world"}`),
                record(`{"addon":"tiktok"}`),
            ]
        }

        const response = lambdaHandler(event);

        await expect(response).resolves.toEqual(expect.arrayContaining(["Unknown app summary"]));
    });

    test("input with valid payload resolves", async () => {
        const event: SQSEvent = {
            Records: [
                record(`{"addon":"com.adaptavist.cloud.search"}`),
            ]
        }

        const response = lambdaHandler(event);

        await expect(response).resolves.toEqual(
            expect.arrayContaining(["Search less. Find more. Enhanced Search makes finding issues in Jira easier, faster and more precise with Enhanced JQL Functions"])
        );
    });

    test("input with valid payloads resolves", async () => {
        const event: SQSEvent = {
            Records: [
                record(`{"addon":"com.adaptavist.cloud.search"}`),
                record(`{"addon":"jql-extensions"}`),
            ]
        }

        const response = lambdaHandler(event);

        await expect(response).resolves.toEqual(
            expect.arrayContaining([
                "Search less. Find more. Enhanced Search makes finding issues in Jira easier, faster and more precise with Enhanced JQL Functions",
                "Organise your issues easily. Major features include advanced searching for attachments, subtasks, comments, versions and links. All keywords can be used in advanced search with autocompletion and saved as filters. No scripting is required."
            ])
        );
    });

    test("input with invalid addon key resolves", async () => {
        const event: SQSEvent = {
            Records: [
                record(`{"addon":"com.adaptavist.cloud.search"}`),
                record(`{"addon":"unknown"}`),
            ]
        }

        const response = lambdaHandler(event);

        await expect(response).resolves.toEqual(
            expect.arrayContaining([
                "Search less. Find more. Enhanced Search makes finding issues in Jira easier, faster and more precise with Enhanced JQL Functions",
                "Unknown app summary"
            ])
        );
    });
});