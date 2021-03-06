const krDays = ['일', '월', '화', '수', '목', '금', '토'];
const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const validFormats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1'];

export type DateToUserFriendlyTimezone = {
    type: 'device' | 'utc' | 'local';
    gmtOffset?: number;
}

export type DateToUserFriendlyOption = {
    lang?: string;
    timezone?: DateToUserFriendlyTimezone;
    isPublished?: boolean;
}

export function dateToUserFriendly(
    jsDate: Date, 
    format: string, 
    option?: DateToUserFriendlyOption
): string {
    const defaultOption = {lang:'ko', timezone:{type:'device'}, isPublished:true} as DateToUserFriendlyOption;
    const finalOption = option ? {...defaultOption, ...option} : defaultOption;
    const {lang, timezone, isPublished} = finalOption;

    if (!jsDate || typeof jsDate.getDate !== 'function' || !format || format.length != 2 || !validFormats.includes(format)) {
        return '';
    }

    let finalDate;
    if (timezone?.type === 'device') {
        finalDate = jsDate;
    } else {
        const currentGmtOffset = -jsDate.getTimezoneOffset()
        const gmtOffset = timezone?.type == 'utc' ? 0 : timezone?.gmtOffset ?? currentGmtOffset;
        const relativeOffset = gmtOffset - currentGmtOffset;
        finalDate = new Date(jsDate.getTime() + 60*1000*relativeOffset)
    }

    let finalDateStr = '';
    const isKorean = lang == 'ko';
    const fullYear = finalDate.getFullYear()
    const month = finalDate.getMonth() + 1;
    const month2 = month < 10 ? '0' + month : month;
    const month3 = months[finalDate.getMonth()];
    const date = finalDate.getDate()
    const date2 = date < 10 ? '0' + date : date;
    const day = isKorean ? krDays[finalDate.getDay()] : enDays[finalDate.getDay()];
    const hour = finalDate.getHours()
    const hour2 = hour < 10 ? '0' + hour : hour;
    const min = finalDate.getMinutes()
    const min2 = min < 10 ? '0' + min : min;

    const monthDateDay = isKorean ? `${month}/${date}(${day})` : `${month3} ${date} ${day}`;

    let hourStr = hour.toString()         

    switch (format) {
    case 'A1':
        finalDateStr = monthDateDay + ' ' + hour2 + ':00'
        break;
    case 'A2':
        finalDateStr = isKorean ?
            monthDateDay + ' ' + hour2 + ':' + min2 :
            `${fullYear}-${month2}-${date2} ${day} ${hour2}:${min2}`;
        break;
    case 'A3':
        finalDateStr = monthDateDay + ' ' + hour + (isKorean? '시' : 'H')
        break;
    case 'A4':
        const measuredDate = new Date(finalDate.getTime() - 1000*3600)
        const mHour = measuredDate.getHours()
        if (isKorean) {
            finalDateStr = monthDateDay + ' ' +  hourStr + '시 발표 (' + mHour + '시 평균)';
        } else {
            finalDateStr = isPublished ? 'Published: ' : 'Average: ';
            finalDateStr += fullYear + '-' + month2 + '-' + date2;
            finalDateStr += ' ' + day + ' ' + hour2 + ':' + '00';
        }
        break;
    case 'B1':
        finalDateStr = isKorean ? 
                `${fullYear}년 ${month}/${date}(${day}) ${hour2}:00` :
                `${fullYear}-${month2}-${date} ${day} ${hour2}:00`;
        break;
    case 'B2':
        finalDateStr = isKorean ? 
                `${fullYear}년 ${monthDateDay}` :
                `${fullYear}-${month2}-${date2} ${day}`;
        break;
    case 'B3':
    case 'B4':
        const label = isKorean ? (isPublished ? '발표' : '평균') : (isPublished ? 'Published' : 'Average')
        let finalHour = isKorean ? hour : hour2;
        if (isPublished) {
            finalDateStr = isKorean ?
                    `${fullYear}년 ${month}/${date}(${day}) ${finalHour}시 ${label}` :
                    `${label}: ${fullYear}-${month2}-${date2} ${day} ${finalHour}:00`;
        } else {
            const measuredDate = new Date(finalDate.getTime() - 1000*3600)
            const fullYear = measuredDate.getFullYear()
            const month = measuredDate.getMonth() + 1;
            const month2 = month < 10 ? '0' + month : month;
            const date = measuredDate.getDate()
            const date2 = date < 10 ? '0' + date : date;
            const day = isKorean ? krDays[measuredDate.getDay()] : enDays[measuredDate.getDay()];
            const hour = measuredDate.getHours()
            const hour2 = hour < 10 ? '0' + hour : hour;
            const enTail = isPublished ? ':00' : format == 'B3' ? 'H' : ':00~59';

            finalDateStr = isKorean ?
                    `${fullYear}년 ${month}/${date}(${day}) ${hour}시 ${label}` :
                    `${label}: ${fullYear}-${month2}-${date2} ${day} ${hour2}${enTail}`;
        }

        break;
    case 'C1': 
        finalDateStr = hourStr + ':00';
        break;      
    default:
        return '';
    }
                
    return finalDateStr;
}

export function getLocalYMD(jsDate: Date, separator?: string): string {
    const septr = separator || '';
    const year = jsDate.getFullYear().toString()
    const month = getMonth2Digits(jsDate)
    const date = getDate2Digits(jsDate)
    return year + septr + month + septr + date;
}

export function getLocalYMDH(jsDate: Date, separator?: string): string {
    const septr = separator || '';
    const year = jsDate.getFullYear()
    const month = getMonth2Digits(jsDate)
    const date = getDate2Digits(jsDate)
    const hour = getHours2Digits(jsDate)
    return year + septr + month + septr + date + septr + hour;
}

export function getLocalYM(jsDate: Date, separator?: string): string {
    const septr = separator || '';
    const year = jsDate.getFullYear()
    const month = getMonth2Digits(jsDate)
    return year + septr + month;
}

function getMonth2Digits(jsDate:Date): string {
    return (jsDate.getMonth()+1).toString().padStart(2, '0')
}

function getDate2Digits(jsDate: Date): string {
    return (jsDate.getDate().toString()).padStart(2, '0')
}

function getHours2Digits(jsDate: Date): string {
    return (jsDate.getHours().toString()).padStart(2, '0')
}

function getMinutes2Digits(jsDate: Date): string {
    return (jsDate.getMinutes().toString()).padStart(2, '0')
}

