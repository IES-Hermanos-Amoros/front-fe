import React from 'react'
import { Link } from "react-router-dom"

const GenericButton = ({
    toParam = "/",
    labelParam = "",
    iconParam = null,
    classNameParam = ""
}) => {
  return (
    <Link to={toParam} className={classNameParam}>
        {iconParam?iconParam:""} {labelParam}
    </Link>
  )
}

export default GenericButton