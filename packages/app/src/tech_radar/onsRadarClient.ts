import {
    TechRadarApi,
    TechRadarLoaderResponse,
    RadarEntry,
    RadarEntryLink,
} from '@backstage/plugin-tech-radar';
import { parse } from 'csv-parse/sync';

interface ProjectRecord {
    Project?: string,
    Languages?: string[],
    Language_Frameworks?: string[],
    Hosted?: string,
    Containers?: string,
    Architectures?: string,
    Source_Control?: string,
    Testing_Frameworks?: string[],
    Cicd?: string[],
    Documentation?: string,
    // ...
}

export class OnsRadar implements TechRadarApi {
    async load(id: string | undefined): Promise<TechRadarLoaderResponse> {
        
        /*
         * The idea is to use the static JSON file to describe the features you want to track,
         * then retrieve project usage data from the CSV.
         */

        // records are wide - one record corresponds to one row corresponds to one project
        const data = parse(
            await fetch("tech_radar/onsTechData.csv").then(res => res.text()),
            { columns: true, }
        );

        const projects: ProjectRecord[] = data.map((element: any) => ({
                ...element,
                Languages: [element.Language_Main, ...element.Language_Others?.split(";") || []],
                Language_Frameworks: [...element.Language_Frameworks?.split(";") || []],
                Testing_Frameworks: [...element.Testing_Frameworks?.split(";") || []],
                Cicd: [...element.Cicd?.split(";") || []],
            }
        )); // map output of parse to members of type ProjectRecord, flattening where necessary

        /* 
        I want to create an entry for each member of a column (but also that entry should know what column it was a member of)
            ... but then how do we describe where in the tech radar it should be? and its timeline? this isn't a reasonable solution
            if we were to describe that data, it would mean replication - any time we add something new, it would have to be added in two different places
        so by nature of a tech radar (where we want to explicitly describe the status of each technology, ADOPT/HOLD etc.), dynamically adding
        entries from the csv doesn't work
        (using the csv data to retrieve additional info - like project usage - is still fine though!)
        */

        const skeleton = await fetch("tech_radar/onsRadarSkeleton.json").then(res => res.json());

        return {
            ...skeleton,
            entries: skeleton.entries.map((entry: RadarEntry) => { 
                
                const relatedProjects = this.getRelatedProjects(entry.title, entry.description, projects);
                return {
                    ...entry,
                    description: this.generateDescription(relatedProjects),
                    links: this.generateLinks(relatedProjects, entry.links),
                    timeline: entry.timeline.map(timeline => {
                        return {
                            ...timeline, 
                            date: new Date(timeline.date),
                        };
                    })
                }
        })
        };

    }

    /**
     * use JSON description in the file to mark type
     * look up entry.title in that type in the list of records
     * return projects which use it and replace the description with this new info
     * 
     * Dirty solution but this is a proof of concept...
     */
    getRelatedProjects(title: string, description: string | undefined, records: ProjectRecord[]): ProjectRecord[] {
        const type = description as keyof ProjectRecord; // uh oh
        const isList = (x: string | string[] | undefined): x is string[] => ((x as string[]).includes !== undefined);

        return records.filter((record) => {
            const column = record[type];
            return isList(column) ? column.includes(title) : column == title;
        })
    }

    generateDescription(projects: ProjectRecord[]): string {
        const projectNames = projects.map((record) => "\n" + record.Project);
        return "**Used by:**" + projectNames;
    }

    generateLinks(projects: ProjectRecord[], existingLinks: RadarEntryLink[] | undefined): RadarEntryLink[] {
        const hasLink = (project: ProjectRecord): project is {Documentation: string, Project: string} => { 
            return project.Documentation != undefined 
                && project.Documentation != ''
                && project.Project != undefined
        };
        const links: RadarEntryLink[] = projects
            .filter(hasLink)
            .map((record) => {
                return {
                    url: record.Documentation,
                    title: record.Project,
                }
            });

        return [
            ...(existingLinks == undefined ? [] : existingLinks), 
            ...links
        ];
    }
}