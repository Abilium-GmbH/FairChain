import { Injectable } from '@angular/core';
import { emojis as flags } from './emojis'

@Injectable({
    providedIn: 'root'
})

/**
 * This component handles the changing/replacing/deleting of flags
 * The Variable currentFlag is used to store the emoji for the saveFlagFromLabel
 */
export class FlagService{

    public currentFlag = "";

    /**
     * Main method for FlagService
     * Finds out if the method has been called without a flag emoji and returns the label without changing it
     * Calls removeFlagFromLabel with the nodeLabel as a param
     * @param nodeLabel is the label of the node that needs a flag added/updated
     * @param nodeFlag is the flag emoji that should be added to the label or replace the existing flag
     * @returns the nodeFlag and nodeLabel as a string separated with an enter 
     */
    public addOrChangeFlag(nodeLabel: string, nodeFlag: string){
        if (nodeFlag === ""){ return nodeLabel };
        nodeLabel = this.removeFlagFromLabel(nodeLabel)
        return nodeFlag +"\n" + nodeLabel;
    }

    /**
     * Helper method for addOrChangeFlag
     * Finds out if the label that is given in includes a flag emoji
     * Returns label without doing anything to it if it is undefined
     * @param label is the label of the node that needs a flag removed
     * @returns the label without the flag
     */
    public removeFlagFromLabel(label: string){
        if (label === undefined){ return label; }
        if (flags.some(v => label.includes(v))){
            label = label.slice(5);
        }
        return label;
    }

    /**
     * Called when you change the text part of a label
     * If there is a flag emoji in the original label, it cuts everything except from the flag emoji
     * and adds on the new label, which does not have a flag in it
     * Returns label without doing anything to it if it is undefined
     * @param originalLabel is the label that the node had
     * @param newLabel is the text part of the label that the node should have
     * @returns the new label with the old flag emoji
     */
    public changeLabelWithoutChangingFlag(originalLabel: string, newLabel: string){
        if (originalLabel === undefined){ return newLabel; }
        if (flags.some(v => originalLabel.includes(v))){
                newLabel = originalLabel.slice(0,5) + newLabel;
        }
        return newLabel;
    }

    /**
     * Checks if there is a flag in the param and extracts it
     * Then it updates the currentFlag variable
     * Sets currentFlag to empty string if label is undefined
     * @param label is the string where we want to extract the flag emoji
     */
    public saveFlagFromLabel(label: string){
        if (label === undefined){ this.currentFlag = ""; } 
        else {
            if (flags.some(v => label.includes(v))){ this.currentFlag =  label.slice(0,4); } 
            else { this.currentFlag = ""; }  
        }
    }
}