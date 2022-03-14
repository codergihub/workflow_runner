function extractPercentage(val1,val2){
 

    const value1ll=parseInt(val1.substring(0,leftLastIndex(val1)).replace('.',''))

    const value2ll=parseInt( val2.substring(0,leftLastIndex(val2)).replace('.',''))
 

    const percentage =Math.floor( (((value1ll)-(value2ll))*100)/(value1ll))
 return  percentage
}

module.exports={
    extractPercentage
}