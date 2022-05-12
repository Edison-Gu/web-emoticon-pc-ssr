import type { NextPage, GetServerSideProps } from 'next'
import Styles from '../styles/Home.module.scss'
import { Card, Row, Col } from 'antd'
import MainContainer from '@/components/common/MainContainer'
import EmotionCard from '@/components/common/EmotionCard'
import { fetchNewestList } from '@/api'
import { getPageUrl } from '@/utils/jumpLink'
interface Props {
  newestList: Array<Object>
}

const Home: NextPage<Props> = (props) => {
  const { newestList } = props
  return (
    <div className={Styles.container}>
      <MainContainer>
        <div className="left-content">
          <Card className="card-container" title="热门表情包" extra={<a href={getPageUrl({type: 'emoticonPage'})}>更多</a>}>
            <Row gutter={[16, 16]}>
              {
                newestList.map((item, index) => (
                  <Col className="aaa" key={index} span={6}>
                    <EmotionCard imgItem={item}/>
                  </Col>
                ))
              }
            </Row>
          </Card>
        </div>
        {/* <div className="right-content">
          右边内容
        </div> */}
      </MainContainer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  let newestList = []
  const { code, data } = await fetchNewestList({})
  if (code === 1) {
    newestList = data
  }
  return { props: { newestList } }
}

export default Home
