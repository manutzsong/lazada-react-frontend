import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Link from '@material-ui/core/Link';
export default ({primary,secondary,divider,imgSrc,url}) => {

    if (imgSrc && url) {
        return (
            <ListItem divider={divider? divider : false} component={Link} target="_blank" rel="noreferrer" href={url}>
                <div className="px-3">
                    <img src={imgSrc} alt="Product Pic" style={{width:"50px",height:"auto"}}/>
                </div>
                <ListItemText primary={primary.slice(0,60)+'...'} secondary={`จำนวน ${secondary} ชิ้น`}/>
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