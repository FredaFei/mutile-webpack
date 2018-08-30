const chalk = require('chalk')
const glob = require('glob')

const moduleList = []
const moduleSrcArr = glob.sync('./src/views/*')

moduleSrcArr.forEach((item)=>{
  let moduleName= item.split('/')[3]
  moduleList.push(moduleName)
})

exports.moduleList = moduleList
exports.getModuleToBuild = function () {
  let moduleToBuild = []
  if (process.env.NODE_ENV === 'production'){
    if(process.env.MODULE_ENV !== 'undefined'){ // 生产环境下对指定文件打包
      moduleToBuild = process.env.MODULE_ENV.split(',')
    } else { // 生产环境下对所有文件打包
      moduleToBuild = moduleList
    }
  }else{
    moduleToBuild = moduleList
  }
  return moduleToBuild
}


