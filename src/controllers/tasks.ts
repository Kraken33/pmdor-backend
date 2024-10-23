import map from 'lodash/fp/map';
import { Client } from '@notionhq/client';
import { asyncPipe } from '../utils/fp';
import { Request, Response } from 'express';
import { prop } from 'lodash/fp';

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

console.log(process.env.NOTION_TOKEN, 'T');

const getList = async (req: Request, res: Response) => {
    res.send(await asyncPipe(
        notion.databases.query,
        (r: any) => { console.log(r); return r },
        prop('results'),
        map<any, { title: string; externalId: string }>((item) => ({
            title: item.properties.Name.title[0].text.content,
            externalId: item.id,
        })),
        // res.send
    )({
        database_id: "629b8e2865824b9d81ecfc37e0b57fee",
        filter: {
            property: "Status",
            status: {
                equals: "In progress"
            }
        },
    }));

    //   console.log(r.results[1].properties.Name.title[0].text.content, 'r');
}

export const tasksController = {
    getList,
};