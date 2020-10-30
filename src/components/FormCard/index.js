import React, {Component} from 'react'
import { DatePicker, List, InputItem, Badge ,TextareaItem} from 'antd-mobile';
import ImgBox from './../ImgBox'
import SelectPicker from './../SelectPicker'
import CasePicker from './../CasePicker'
import MultiplePicker from './../MultiplePicker'

export default class FormCard extends Component {

	onChange = (changedValue) => {
		const {formItemValueOnChange} = this.props
		if(formItemValueOnChange){
			formItemValueOnChange(changedValue);
		}
		// const onChange = this.props.onChange;
		// if(onChange) {
		// 	onChange(changedValue);
		// }
	}
	render() {

		const {formItem, optionsMap, getFieldProps,formItemValueOnChange,unavailable} = this.props

		const key=formItem.code;
		if (formItem) {
			const fieldName = formItem.name
			let fieldValue = formItem.value;
			if (fieldValue && fieldValue instanceof String   && fieldValue.indexOf("@R@") > 0) {
				fieldValue = fieldValue.split("@R@")[1];
			}
			const title = formItem.title
			const fieldId = formItem.fieldId
			const validators = formItem.validators
			const type=formItem.type;
			const available=unavailable?false:formItem.fieldAccess && formItem.fieldAccess!=="读" && formItem.fieldAvailable;
			if (type === "text") {
				return <InputItem
					{...getFieldProps(fieldName, {
						initialValue: fieldValue ? fieldValue : "",
						rules: validators ? [{
							required: true, message: `请选择${title}`,
						}] : "",
						onChange:()=>formItemValueOnChange(fieldName)
					})}


					placeholder={`请输入${title}`}
					key={fieldId}
					editable={available === false ? false : true}
					clear
				><Badge dot={validators ? true : false}>{title}</Badge></InputItem>
			}if (type === "hidden") {
				return <InputItem
					{...getFieldProps(fieldName, {
						initialValue: fieldValue ? fieldValue : "",
						rules: validators ? [{
							required: true, message: `请选择${title}`,
						}] : "",
					})}
					type={type}
					placeholder={`请输入${title}`}
					key={fieldId}
					clear
				></InputItem>
			} else if (type === "textarea") {
				return <TextareaItem
					{...getFieldProps(fieldName, {
						initialValue: fieldValue ? fieldValue : "",
						rules: validators ? [{
							required: true, message: `请选择${title}`,
						}] : "",
						onChange:()=>formItemValueOnChange(fieldName)
					})}
					title={title}
					placeholder={`请输入${title}`}
					key={fieldId}
					editable={available === false ? false : true}
					clear
				><Badge dot={validators ? true : false}>{title}</Badge></TextareaItem>
			} else if (type === "int") {
				return <InputItem
					{...getFieldProps(fieldName, {
						initialValue: fieldValue ? fieldValue : "",
						onChange:()=>formItemValueOnChange(fieldName)
					})}
					type={'number'}
					editable={available === false ? false : true}
					placeholder={`请输入${title}`}
					key={fieldId}
					clear
				>{title}</InputItem>
			}else if (type === "decimal") {
				return <InputItem
					{...getFieldProps(fieldName, {
						initialValue: fieldValue ? fieldValue : "",
						onChange:()=>formItemValueOnChange(fieldName)
					})}
					editable={available === false ? false : true}
					type={'digit'}
					placeholder={`请输入${title}`}
					key={fieldId}
					clear
				>{title}</InputItem>
			} else if (type === "date") {
				let time = "";
				let time_date = ""
				if (fieldValue) { //字符串转化为时间格式
					time = fieldValue.replace(/-/g, "/");
					time_date = new Date(time)
				}
				return <DatePicker
					extra="请选择(可选)"
					mode="date"
					title={`请选择${title}`}
					disabled={available === false ? true : false}
					key={fieldId}
					{...getFieldProps(fieldName, {
						initialValue: time_date,
						onChange:()=>formItemValueOnChange(fieldName)
					})}
					onOk={e => console.log('ok', e)}
					onDismiss={e => console.log('dismiss', e)}
				>
					<List.Item arrow="horizontal">{title}</List.Item>
				</DatePicker>
			}else if (type === "datetime") {
				let time = "";
				let time_date = ""
				if (fieldValue) { //字符串转化为时间格式
					time = fieldValue.replace(/-/g, "/");
					time_date = new Date(time)
				}
				return <DatePicker
					extra="请选择(可选)"
					mode="datetime"
					title={`请选择${title}`}
					disabled={available === false ? true : false}
					key={fieldId}
					{...getFieldProps(fieldName, {
						initialValue: time_date,
						onChange:()=>formItemValueOnChange(fieldName)
					})}
					onOk={e => console.log('ok', e)}
					onDismiss={e => console.log('dismiss', e)}
				>
					<List.Item arrow="horizontal">{title}</List.Item>
				</DatePicker>
			} else if (type === "file") {
				const files = fieldValue ? [{
					url: fieldValue,
					id: fieldId,
				}] : []
				const imgPick = <ImgBox
					files={files}
					{...getFieldProps(fieldName,{
						onChange:()=>formItemValueOnChange(fieldName)
					})}
				/>
				return <div>
					<List.Item extra={imgPick}>{title}</List.Item>
				</div>
			} else if (type === "select") {
				let optdata = []
				if (optionsMap && fieldId) {
					for (let k in optionsMap) {
						if (k === fieldId.toString()) {
							if (optionsMap[k] != null) {
								optionsMap[k].forEach((it) => {
									it["label"] = it.title
								})
								optdata.push(optionsMap[k])
							}

						}
					}
					return <SelectPicker
						formItem={formItem}
						optdata={optdata}
						disabled={available === false ? true : false}
						dot={formItem.validators === "required" ? true : false}
						{...getFieldProps(fieldName, {
							initialValue: fieldValue ? fieldValue : "",
							rules: validators ? [{
								required: true, message: `请选择${title}`,
							}] : "",
							onChange:()=>formItemValueOnChange(fieldName)
						})}
					/>
				}
			} else if(type === "relation") {
				    let optdata = []
				    let dot=false//必选标记
				    optdata.push(formItem.relationSubdomain)
				    if(formItem.validators==="required"){
				        dot=true
				    }
				    // const list={
				    //     fieldId:fieldId,
				    //     name:fieldName,
				    //     title:title,
				    //     type:type,
				    //     validators:validators,
				    //     value:fieldValue
				    // }
				    return <SelectPicker
						formItem={formItem}
				        optdata={optdata}
				        key={key}
				        disabled={available===false?true:false}

				        dot={dot}
				        {...getFieldProps(fieldName,{
				            initialValue:fieldValue?fieldValue:"",
				            rules:validators?[{
				                required: true, message: `请选择${title}`,
				            }]:"",
							onChange:()=>formItemValueOnChange(fieldName)
				        })} />
			}
			else if (type === "caselect") {
				return <CasePicker
					onChange={()=>formItemValueOnChange(fieldName)}
					formItem={formItem}
					disabled={available===false?true:false}
					{...getFieldProps(fieldName, {
						initialValue: fieldValue ? fieldValue : "",
					})}
				/>
			} else if (type === "label") {
				return <MultiplePicker
					disabled={available===false?true:false}
					formItem={formItem}
					optionsMap={optionsMap ? optionsMap : []}
					{...getFieldProps(fieldName, {
						initialValue: fieldValue ? fieldValue : "",
						onChange:()=>formItemValueOnChange(fieldName)
					})}
				/>
			}
		}
			return <div key={key}></div>

	}

}