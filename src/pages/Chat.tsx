import React from "react";
import { inject, observer } from "mobx-react";
import { Row, Col, Layout } from "antd";
import { ChatLayout, InfoLayout, ContactsLayout } from "@layouts";
import IStores, { IAppStore, IContactStore } from "@stores/interface";
import "@styles/index.scss";

type IProps = {
  appStore?: IAppStore;
  contactStore?: IContactStore;
};

const App = inject((stores: IStores) => ({ appStore: stores.appStore }))(
  observer((props: IProps) => {
    const { appStore } = props;
    const layout = appStore.layout;

    return (
      <Layout hasSider={true} className="chat_page">
        <Row>
          <Col
            xs={layout === "contact" ? 24 : 0}
            sm={layout === "contact" ? 24 : 0}
            md={layout === "contact" ? 10 : 0}
            lg={7}
            xl={6}
            xxl={6}
          >
            <ContactsLayout />
          </Col>
          <Col xs={layout === "chat" ? 24 : 0} sm={layout === "chat" ? 24 : 0} md={14} lg={10} xl={12} xxl={12}>
            <ChatLayout />
          </Col>
          <Col
            xs={layout === "info" ? 24 : 0}
            sm={layout === "info" ? 24 : 0}
            md={layout === "info" || layout === "chat" ? 10 : 0}
            lg={7}
            xl={6}
            xxl={6}
          >
            <InfoLayout />
          </Col>
        </Row>
      </Layout>
    );
  })
);

export default App;
