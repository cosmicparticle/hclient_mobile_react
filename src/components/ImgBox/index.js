import React, {Component} from 'react'
import { ImagePicker } from 'antd-mobile';

export default class ImgBox extends Component {

	state = {
		receivedFilesProps: false,
	}

	componentWillMount(){
		let files=this.props.files;
			this.setState({
				files,
			});
	}
	componentWillReceiveProps(nextProps) {
 		let {receivedFilesProps}=this.state;
// 		if(isRemove){
// 			this.setState({
// 				isRemove:false,
// 			});
// }else{
		//只接收一次
		if(!receivedFilesProps){
			let files=nextProps.files;
			this.setState({
				files,
				receivedFilesProps:true,
			});
		}

		// }
		console.log(nextProps);
	}
	onChange = (files, type) => {
		console.log(files, type);
		// let isRemove=type==="remove"?true:false;
		this.setState({
			files,
		});
		if(type==="remove"){
			this.triggerChange( "removefile");
		}else{
			this.triggerChange(files.length > 0 ? files[0].file : "");
		}
	}
	triggerChange = (changedValue) => {
		const onChange = this.props.onChange;
		if(onChange) {
			onChange(changedValue);
		}
	}
	render() {
		//let files=this.state.files&&this.state.files.length>0?this.state.files:this.props.files;
		let files=this.state.files;
		return(
			<div>
                <ImagePicker
                    files={files}
                    onChange={this.onChange}
                    onImageClick={(index, fs) => console.log(index, fs)}
                    selectable={files.length < 1}
                    multiple={false}
                />
            </div>
		)
	}
}