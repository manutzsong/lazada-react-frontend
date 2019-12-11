import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Divider } from '@material-ui/core';



export default ({primary,secondary,divider,imgSrc,url}) => {

    if (imgSrc && url) {
        return (
            <ListItem divider={divider? divider : false}>
                <div className="px-3">
                    <img src={imgSrc} style={{width:"50px",height:"auto"}}/>
                </div>
                <ListItemText primary={primary} secondary={secondary}/>
            </ListItem>
        )
    }
    else {
        return (
            <ListItem divider={divider? divider : false}>
                <ListItemText primary={primary} secondary={secondary}/>
            </ListItem>
        )
    }
    


}