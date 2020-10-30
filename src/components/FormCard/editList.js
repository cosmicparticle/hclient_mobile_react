import React, {Component} from 'react'
import FormCard from './index'
import Units from './../../units'
import { DatePicker, List, InputItem, Badge,TextareaItem } from 'antd-mobile';
import ImgBox from './../ImgBox'
import SelectPicker from './../SelectPicker'
import CasePicker from './../CasePicker'
import MultiplePicker from './../MultiplePicker'

export default class EditList extends Component {

    initFormList = () => {
        const {formList,optionsMap,getFieldProps,isDrawer,rabcTemplateupdatable,formItemValueOnChange,unallowedDelete,rabcUnupdatable,unmodifiable} = this.props
        const formItemList=[];
        let code;
        let namePrefix
        if(formList.list && formList.list.length>0){
            formList.list.forEach((item,index)=>{
                if(item.code){
                    code=item.code;
                }
                if(item.name &&  item.name.indexOf(".")>0){
                    namePrefix=item.name.split(".")[0];
                }
                const type=item.type;
                const key=item.code+index
                if(type === "deletebtn" ){
                        const deletebtn=<p className="deteleLine" key={key}>
                            {unallowedDelete?null:
                                <span
                                    className="iconfont"
                                    style={{float:"right",top:"0"}}
                                    onClick={this.props.deleteList}
                                >&#xe676;</span>}
                            {!isDrawer && !rabcUnupdatable?<span
                                className="iconfont"
                                style={{float:"right",top:"5px",right:'10px'}}
                                onClick={this.props.editTemplate}
                            >&#xe8ae;</span>:null}
                        </p>
                        formItemList.unshift(deletebtn)
                }else{
                    const formIt= <FormCard  unavailable={unmodifiable} key={Units.RndNum(9)} formItemValueOnChange={formItemValueOnChange}
                        formItem={item} getFieldProps={getFieldProps} optionsMap={optionsMap}
                    ></FormCard>
                    formItemList.push(formIt);
                }
            })
            //放入唯一编码
            // let codeItem= <InputItem
            //     {...getFieldProps('唯一编码',{
            //         initialValue: code ? code : "",
            //     })}
            //     key={code+1}
            //     type={'text'}
            //     clear
            //     placeholder={`请输入`}
            // >{"唯一编码"}</InputItem>
           let codeName=namePrefix +'.code';
            let codeItem={
                type:'hidden',
                name:codeName,
                value:code,
                title:'唯一编码',
            }
            let codeFormItem=  <FormCard key={Units.RndNum(9)}  formItemValueOnChange={formItemValueOnChange} formItem={codeItem} getFieldProps={getFieldProps} optionsMap={optionsMap}
            ></FormCard>

            formItemList.push(codeFormItem);
        }
        return formItemList;
    }
    render(){
        return (
            this.initFormList()
        )
    }
}