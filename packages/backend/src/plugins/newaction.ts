// you might need to add these if they aren't already present in the file you're working in
import { createTemplateAction } from '@backstage/plugin-scaffolder-node'
import { writeFile } from 'fs';

export const createNewAction = () => {
    return createTemplateAction({
        id: 'ons:file:create',
        schema: {
            input: {
                required: ['content', 'filename'],
                type: 'object',
                properties: {
                    contents: {
                        type:'string',
                        title: 'Content',
                        description: 'The content of the file',
                    },
                    filename: {
                        type:'string',
                        title: 'Filename',
                        description: 'The filename of the file',
                        },
                    },
                },
            },
            // the action schema goes here - this is the object which describes the inputs and outputs of the action
            // have a look at either the existing actions or the ones I've added for an idea of what this looks like
    
        async handler(ctx) {
            const { signal } = ctx;
            await writeFile(
                `${ ctx.workspacePath }/${ ctx.input.filename }`,
                ctx.input.contents,
                { signal },
                _=> {},
            );
            // this callback determines what the action actually does - you can put any code in here and it'll run when the action does
            // the ctx ("context") object contains a bunch of useful stuff for this:
 
            // - ctx.input contains the inputs you described in the schema object above. for example, ctx.input.repoUrl could have a GitHub URL that you use in the GitHub API
            //   this works because the type of ctx.input is JsonObject, so its keys are determined at runtime - just make sure the names match up between the schema and here
 
            // - ctx.output("key", $value) is a *function* which lets you set the output of the action.
            //   this isn't super commonly used unless you're making more complex actions, but it's good to know about
 
            // - ctx.logger carries the logger object for the scaffolder. this gives you access to methods like ctx.logger.info() and ctx.logger.error(), which print messages to the log
            //   the messages are visible both in the terminal window running backstage *and* inside the window that pops up while the template is running
            //   these functions are incredibly useful for debugging!
 
            // if you type "ctx." into VSCode, it should show you all of the object members that you can make use of as autocomplete options
        },
    });
};