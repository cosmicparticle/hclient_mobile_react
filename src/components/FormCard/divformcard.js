import React, {Component} from 'react'
import FormCard from './index'
import Units from './../../units'


export default class DivFormCard extends Component {


	render() {

		const {formItem, optionsMap, getFieldProps,formItemValueOnChange} = this.props
		const key=formItem.code;
		return	<div  className="formcard">
				<FormCard
					formItemValueOnChange={formItemValueOnChange}
					formItem={formItem} getFieldProps={getFieldProps} optionsMap={optionsMap}></FormCard>
			</div>
	}

}