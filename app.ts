import { SQSEvent, SQSRecord } from 'aws-lambda';
import * as z from 'zod';
import axios from 'axios';

const PayloadCodec = z.object({
    addon: z.string()
});

type Payload = z.infer<typeof PayloadCodec>;

const ApiResponseCodec = z.object({
    // TODO
});
type ApiResponse = z.infer<typeof ApiResponseCodec>;

const parseRecord = (record: SQSRecord): Payload => {
    try {
        return PayloadCodec.parse(JSON.parse(record.body));
    } catch (e) {
        console.log("Failed to parse", e);
        return { addon: "invalid" };
    }
}

export const lambdaHandler = async (event: SQSEvent): Promise<string[]> => {
    const relevantPayloads = event.Records
        .map(parseRecord)
        .filter(payload => payload.addon !== 'invalid');

    if (!relevantPayloads.length) {
        throw new Error('No valid records');
    }

    // TODO
    // For each entry in `relevantPayloads` make a request to the Atlassian Marketplace REST API using
    // the addonKey to get the app summary
    // Validate the HTTP response from the REST API using zod, if it's invalid return "Unknown app summary"

    return Promise.resolve([]);
};